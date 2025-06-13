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
          
          <button
            onClick={async () => {
              const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
              if (error) {
                alert(error.message);
              }
            }}
            className="w-full flex items-center justify-center space-x-2 bg-[#8A7CFF] hover:bg-[#6C5CE7] text-white py-3 rounded-lg transition-colors"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

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