import supabase from '../lib/supabase.ts';

/**
 * 使用Google令牌进行登录
 * 这种方法避开了Supabase的OAuth流程，直接使用Google返回的令牌
 */
export const signInWithGoogleToken = async (accessToken: string) => {
  try {
    // 使用令牌获取用户信息
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    const userInfo = await userInfoResponse.json();
    console.log('Google用户信息:', userInfo);
    
    if (!userInfo.email) {
      throw new Error('未能获取用户邮箱');
    }
    
    // 先检查用户是否已存在于Supabase
    const { data: { user: existingUser }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError && getUserError.message !== 'User not found' && !existingUser) {
      console.log('获取用户失败，尝试创建或登录:', getUserError);
      
      // 使用自定义注册方式 - 首先注册，然后登录
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: generateRandomPassword(), // 生成随机密码
        options: {
          data: {
            name: userInfo.name,
            avatar_url: userInfo.picture,
            provider: 'google',
          }
        }
      });
      
      if (signUpError) {
        console.error('注册用户失败:', signUpError);
        
        // 如果注册失败，尝试直接登录（可能用户已存在）
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userInfo.email,
          password: 'temppassword123', // 这是一个假设，实际环境中不会成功，会使用魔术链接
        });
        
        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // 预期的错误，发送魔术链接
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: userInfo.email,
            options: {
              // 使用当前域名作为重定向地址，避免硬编码
              emailRedirectTo: window.location.origin,
            }
          });
          
          if (otpError) {
            console.error('发送魔术链接失败:', otpError);
            throw otpError;
          }
          
          return {
            user: userInfo,
            message: '登录链接已发送到您的邮箱，请查收',
            needsEmailVerification: true
          };
        } else if (signInError) {
          throw signInError;
        }
      }
    } else {
      console.log('用户已登录或找到:', existingUser);
    }
    
    // 将Google用户信息保存到localStorage
    // 使用统一的键名 'user'，而不是 'googleUserInfo'
    const userData = {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      credits: 0,
      id: existingUser?.id
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 创建或更新用户记录
    try {
      if (existingUser) {
        // 用Supabase的ID更新用户数据
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: existingUser.id,
            email: userInfo.email,
            name: userInfo.name || '',
            avatar_url: userInfo.picture || '',
            provider: 'google',
            updated_at: new Date().toISOString()
          });
        
        if (upsertError) {
          console.error('更新用户资料失败:', upsertError);
        } else {
          console.log('用户资料已更新');
          
          // 记录登录日志
          await logLogin(existingUser.id, true);
        }
      }
    } catch (profileError) {
      console.error('处理用户资料错误:', profileError);
    }
    
    // 在成功后重定向到当前域名，确保不会跳转到localhost
    const currentOrigin = window.location.origin;
    console.log('准备重定向到:', currentOrigin);
    
    // 使用setTimeout给浏览器一点时间完成其他操作
    setTimeout(() => {
      // 使用history API清除URL中的hash部分
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // 如果当前不是根路径，跳转到根路径
      if (window.location.pathname !== '/') {
        window.location.href = currentOrigin;
      } else if (window.location.href !== currentOrigin) {
        // 如果当前URL不完全匹配期望的origin (可能包含hash或search参数)
        window.location.href = currentOrigin;
      } else {
        // 如果已经在正确的URL，刷新页面以更新状态
        window.location.reload();
      }
    }, 500);
    
    return {
      user: userInfo,
      message: '登录成功！',
    };
  } catch (error) {
    console.error('使用Google令牌登录失败:', error);
    throw error;
  }
};

// 生成随机密码
function generateRandomPassword() {
  return Math.random().toString(36).slice(-10) + 
         Math.random().toString(36).slice(-10) + 
         Math.random().toString(36).slice(-10);
}

/**
 * 使用邮箱登录
 */
export const signInWithEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 使用当前域名作为重定向地址，避免硬编码
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      throw error;
    }
    
    return {
      message: '登录链接已发送到您的邮箱',
    };
  } catch (error) {
    console.error('使用邮箱登录失败:', error);
    throw error;
  }
};

/**
 * 登出
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // 清除localStorage中的用户信息
    localStorage.removeItem('user');
    localStorage.removeItem('googleUserInfo'); // 清除旧键名，确保兼容性
    
    // 重定向到当前域名的根路径
    const currentOrigin = window.location.origin;
    window.location.href = currentOrigin;
    
    return {
      message: '登出成功',
    };
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return data.user;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

/**
 * 记录登录日志
 */
export const logLogin = async (userId: string, success: boolean, errorMessage?: string) => {
  try {
    console.log('开始记录登录日志，用户ID:', userId);
    
    // 获取IP地址
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();
    
    // 检测设备类型
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      deviceType = 'mobile';
    }
    
    // 构建登录日志数据
    const logData = {
      user_id: userId,
      ip_address: ip,
      user_agent: navigator.userAgent,
      device_type: deviceType,
      success,
      error_message: errorMessage,
    };
    
    console.log('登录日志数据:', logData);
    
    // 记录登录日志
    const { data, error } = await supabase
      .from('login_logs')
      .insert([logData])
      .select();
    
    if (error) {
      console.error('记录登录日志失败:', error);
    } else {
      console.log('登录日志记录成功:', data);
    }
  } catch (error) {
    console.error('记录登录日志异常:', error);
  }
}; 