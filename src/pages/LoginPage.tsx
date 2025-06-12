import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LoginPage = () => {
  const supabaseClient = useSupabaseClient();
  const session = useSession();
  const navigate = useNavigate();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#121a22] text-white pt-20 pb-10">
        <div className="max-w-md mx-auto p-6 bg-[#1a1e27] rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">登录/注册</h1>
          
          <Auth
            supabaseClient={supabaseClient}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8A7CFF',
                    brandAccent: '#6C5CE7',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            magicLink={true}
            theme="dark"
            localization={{
              variables: {
                sign_in: {
                  email_label: '邮箱地址',
                  password_label: '密码',
                  button_label: '登录',
                  link_text: '已有账号？登录',
                  email_input_placeholder: '您的邮箱地址',
                  password_input_placeholder: '您的密码',
                },
                sign_up: {
                  email_label: '邮箱地址',
                  password_label: '密码',
                  button_label: '注册',
                  link_text: '没有账号？注册',
                  email_input_placeholder: '您的邮箱地址',
                  password_input_placeholder: '创建一个密码',
                },
                magic_link: {
                  button_label: '使用魔术链接登录',
                  link_text: '通过邮箱魔术链接登录',
                },
                forgotten_password: {
                  email_label: '邮箱地址',
                  button_label: '发送重置指令',
                  link_text: '忘记密码？',
                  email_input_placeholder: '您的邮箱地址',
                },
              },
            }}
          />

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>登录即表示您同意我们的</p>
            <p>
              <a href="/terms-of-service" className="text-[#8A7CFF] hover:underline">
                服务条款
              </a>{' '}
              和{' '}
              <a href="/privacy-policy" className="text-[#8A7CFF] hover:underline">
                隐私政策
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage; 