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
    // 确保进入登录页后滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [session, navigate]);

  return (
    <>
      <div className="hidden md:block"><Navbar /></div>
      <div className="min-h-screen bg-gradient-to-b from-[#1b1e26] via-[#12151c] to-[#0b0d12] flex items-center justify-center py-16 px-4 text-white relative overflow-hidden">
        {/* 背景柔光圆 */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-[#6C5CE7]/20 blur-3xl rounded-full"></div>
        <div className="w-full max-w-md bg-[#1f1f25] rounded-xl overflow-hidden shadow-2xl">
          {/* 顶部展示图 */}
          <div className="h-56 w-full overflow-hidden">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/videos/login_background.mp4" type="video/mp4" />
            </video>
          </div>

          {/* 内容区域 */}
          <div className="p-8 text-center">
            {/* 品牌 Logo */}
            <div className="flex justify-center mb-8">
              <img src="/VEOAI2.svg" alt="VEOAI" className="h-10" />
            </div>

            {/* Google button with visible gradient border */}
            <div className="p-[1px] rounded-xl bg-gradient-to-r from-[#FBBC05] via-[#EA4335] via-[#34A853] via-[#4285F4] to-[#A142F4]">
              <button
                onClick={async () => {
                  const { data, error } = await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: { skipBrowserRedirect: true },
                  });
                  if (error) return alert(error.message);
                  if (data?.url) {
                    const w = 480,
                      h = 600,
                      left = window.screenX + (window.innerWidth - w) / 2,
                      top = window.screenY + (window.innerHeight - h) / 2;
                    const popup = window.open(
                      data.url,
                      'oauth-google',
                      `width=${w},height=${h},left=${left},top=${top},resizable=no,toolbar=no,menubar=no`
                    );

                    const { data: listener } = supabaseClient.auth.onAuthStateChange((event) => {
                      if (event === 'SIGNED_IN') {
                        popup?.close();
                        listener.subscription.unsubscribe();
                        window.location.href = '/';
                      }
                    });
                  }
                }}
                className="w-full flex items-center justify-center gap-4 px-8 py-4 bg-[#1f1f25] rounded-[inherit] text-white font-medium hover:bg-[#27272f] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  <span className="text-lg">Continue with Google</span>
                </div>
                <span className="text-2xl ml-1">→</span>
              </button>
            </div>

            <p className="mt-10 text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/terms-of-service" className="text-[#8A7CFF] hover:underline">Terms of Service</a> and{' '}
              <a href="/privacy-policy" className="text-[#8A7CFF] hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage; 