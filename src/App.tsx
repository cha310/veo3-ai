import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoGallery from './components/VideoGallery';
import Features from './components/Features';
import HowToCreate from './components/HowToCreate';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import VideoEffects from './pages/VideoEffects';
import TextToVideo from './pages/TextToVideo';
import Pricing from './pages/Pricing';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import AIFrenchKissing from './pages/AIFrenchKissing';
import AdminLogs from './pages/AdminLogs';
import CanonicalHead from './components/CanonicalHead';
import DebugPage from './pages/debug';
import LoginPage from './pages/LoginPage';
import supabase from './lib/supabase.ts';

// 从环境变量获取Google OAuth客户端ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1049691614917-7ncrqa4qmmg4oiamn8i1dfbrvphicoju.apps.googleusercontent.com';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.veo3-ai.net';

function App() {
  // 检查URL中是否包含会话令牌
  useEffect(() => {
    // 处理Supabase回调并设置会话
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App组件内的认证状态变化:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('用户已登录，存储会话状态 (App级别)');
        
        // 记录基本信息到控制台，帮助调试
        console.log('当前域名:', window.location.origin);
        console.log('预期站点URL:', SITE_URL);
        
        // 如果URL包含访问令牌，清理URL
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    // 检查URL哈希是否包含访问令牌（处理OAuth重定向）
    const handleRedirectState = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log('URL中检测到访问令牌，可能是OAuth重定向');
        try {
          // 创建会话
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('获取会话错误:', error);
          } else if (data?.session) {
            console.log('成功获取会话:', data.session.user?.id);
            // 成功后清除URL中的哈希部分
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (err) {
          console.error('处理OAuth重定向错误:', err);
        }
      }
    };

    handleRedirectState();

    // 清理函数
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SessionContextProvider supabaseClient={supabase}>
        <BrowserRouter>
          <CanonicalHead baseUrl={SITE_URL} />
        <div className="min-h-screen bg-[#121a22]">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <main>
                  <Hero />
                  <VideoGallery />
                  <Features />
                    <HowToCreate />
                  <FAQ />
                </main>
                <Footer />
              </>
            } />
            <Route path="/video-effects" element={<VideoEffects />} />
              <Route path="/create-video" element={<TextToVideo />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/ai-french-kissing" element={<AIFrenchKissing />} />
              <Route path="/admin-logs" element={<AdminLogs />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
        </BrowserRouter>
      </SessionContextProvider>
    </GoogleOAuthProvider>
  );
}

export default App;