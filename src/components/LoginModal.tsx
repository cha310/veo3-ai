import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import supabase from '../lib/supabase.ts';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { signInWithGoogleToken, signInWithEmail, logLogin } from '../services/auth';

// 不要在这里设置AppElement，因为在服务器渲染时会出错

interface LoginModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

interface GoogleUserData {
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, signInWithGoogle } = useSupabaseAuth();
  
  // API基础URL - 动态获取当前域名
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:9000' // 开发环境
    : ''; // 生产环境使用相对路径
  
  // 在组件挂载时设置Modal的appElement
  useEffect(() => {
    // 确保Modal可访问性，在客户端执行
    Modal.setAppElement('#root');
  }, []);

  // 如果用户已登录，关闭模态框
  useEffect(() => {
    if (user) {
      onRequestClose();
    }
  }, [user, onRequestClose]);
  
  // 记录用户登录信息
  const logUserLogin = async (userData: any) => {
    try {
      console.log('记录用户登录信息:', userData);
      
      // 尝试测试API连接
      try {
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('健康检查响应:', healthResponse.data);
      } catch (healthError) {
        console.error('健康检查失败:', healthError);
      }
      
      // 发送实际请求
      const response = await axios.post(`${API_BASE_URL}/api/auth/log-login`, {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      });
      console.log('用户登录信息记录成功, 响应:', response.data);
    } catch (error: any) {
      console.error('记录登录信息错误:', error);
      console.error('错误详情:', error.response?.data || error.message);
      // 不阻止用户继续使用，只记录错误
    }
  };
  
  // 使用Google登录
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        console.log('Google登录成功，获取到访问令牌');
        
        // 使用我们自定义的服务来处理Google登录
        const result = await signInWithGoogleToken(codeResponse.access_token);
        
        // 显示成功消息
        if (result.needsEmailVerification) {
          alert(result.message);
          onRequestClose();
        } else {
          console.log('登录成功，准备更新UI');
          
          // 关闭登录模态框
          onRequestClose();
          
          // 记录登录信息到传统服务器（如果需要）
          if (result.user) {
            await logUserLogin({
              email: result.user.email,
              name: result.user.name,
              picture: result.user.picture
            });
          }
          
          // 不需要在这里处理重定向，因为auth.ts中已经做了处理
          // 即：登录成功后，auth.ts会负责重定向到正确的URL
        }
      } catch (error) {
        console.error('Google login error:', error);
        setLoginError('登录失败，请重试');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setLoginError('登录失败，请重试');
      setIsLoading(false);
    },
    flow: 'implicit', // 使用隐式流程，避免重定向问题
  });

  // 使用Supabase的Google OAuth登录
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log('开始Supabase Google OAuth登录流程');
      await signInWithGoogle();
    } catch (error) {
      console.error('Google登录错误:', error);
      setLoginError('登录失败，请重试');
      setIsLoading(false);
    }
  };

  // 使用邮箱继续
  const handleContinue = async () => {
    if (!email.trim()) {
      setLoginError('Please enter your email address');
      return;
    }
    
    // 检查是否为谷歌邮箱
    if (!email.endsWith('@gmail.com')) {
      setLoginError('Only Google Gmail can be used to register');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 使用我们自定义的服务来处理邮箱登录
      const result = await signInWithEmail(email);
      alert(result.message);
      onRequestClose();
    } catch (error) {
      console.error('发送登录链接失败:', error);
      setLoginError('Failed to send login link, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // 设备类型检测函数
  const detectDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  // 获取IP地址函数
  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP:', error);
      return 'unknown';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center p-4 outline-none bg-transparent max-w-md mx-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center"
      contentLabel="Login Modal"
      portalClassName="modal-portal" 
    >
      <div className="bg-[#1a1e27] rounded-xl p-8 w-full max-w-md relative text-white">
        {/* 关闭按钮 */}
        <button 
          onClick={onRequestClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Sign Up for VEOAI</h2>
          <p className="text-gray-400">Enter your email address to create an account.</p>
        </div>

        {/* 邮箱输入 */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">
            Email address<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#252a37] border border-[#343a4d] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            placeholder="Email"
            disabled={isLoading}
          />
        </div>

        {/* 错误消息 */}
        {loginError && (
          <div className="mb-4 text-red-500 text-sm">
            {loginError}
          </div>
        )}

        {/* 继续按钮 */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#373d4f] hover:bg-[#444a5f] text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : '继续'}
        </button>

        {/* 分隔线 */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-[#343a4d]"></div>
          <span className="px-4 text-gray-400">or</span>
          <div className="flex-grow h-px bg-[#343a4d]"></div>
        </div>

        {/* Google登录按钮 - 使用Supabase OAuth方式 */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1e27] border border-[#343a4d] hover:bg-[#252a37] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? '处理中...' : '使用Google继续'} 
          <span className="text-gray-500">→</span>
        </button>

        {/* 登录链接 */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            By signing up, you agree to our{' '}
            <a href="/terms-of-service" className="text-[#8A7CFF] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="text-[#8A7CFF] hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal; 