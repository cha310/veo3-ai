import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

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
  
  // 在组件挂载时设置Modal的appElement
  useEffect(() => {
    // 确保Modal可访问性，在客户端执行
    Modal.setAppElement('#root');
  }, []);
  
  // 使用Google登录
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // 获取用户信息
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${codeResponse.access_token}`,
            },
          }
        );
        
        const userInfo = await userInfoResponse.json();
        
        // 检查是否为谷歌邮箱
        if (!userInfo.email.endsWith('@gmail.com')) {
          setLoginError('Only Google Gmail can be used to register');
          return;
        }
        
        // 处理登录成功
        localStorage.setItem('user', JSON.stringify(userInfo));
        onRequestClose();
        window.location.reload(); // 刷新页面以更新登录状态
      } catch (error) {
        console.error('Google login error:', error);
        setLoginError('Login failed, please try again');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setLoginError('Login failed, please try again');
    },
  });

  // 使用邮箱继续
  const handleContinue = () => {
    if (!email.trim()) {
      setLoginError('Please enter your email address');
      return;
    }
    
    // 检查是否为谷歌邮箱
    if (!email.endsWith('@gmail.com')) {
      setLoginError('Only Google Gmail can be used to register');
      return;
    }
    
    // 执行谷歌登录
    googleLogin();
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
        >
          Continue
        </button>

        {/* 分隔线 */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-[#343a4d]"></div>
          <span className="px-4 text-gray-400">or</span>
          <div className="flex-grow h-px bg-[#343a4d]"></div>
        </div>

        {/* Google登录按钮 */}
        <button
          onClick={() => googleLogin()}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1e27] border border-[#343a4d] hover:bg-[#252a37] text-white font-medium py-3 px-4 rounded-lg transition-colors"
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
          Continue with Google 
          <span className="text-gray-500">→</span>
        </button>

        {/* 登录链接 */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Already have an account?{' '}
            <a href="#" className="text-[#e6436d] hover:underline">
              Log in here
            </a>
          </p>
        </div>

      </div>
    </Modal>
  );
};

export default LoginModal; 