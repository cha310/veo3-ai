import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
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
import supabase from './lib/supabase.ts';

// Google OAuth 客户端ID
const GOOGLE_CLIENT_ID = '1049691614917-7ncrqa4qmmg4oiamn8i1dfbrvphicoju.apps.googleusercontent.com';

function App() {
  // 检查URL中是否包含会话令牌
  useEffect(() => {
    // 处理Supabase回调并设置会话
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App组件内的认证状态变化:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('用户已登录，存储会话状态 (App级别)');
        // 可能需要在这里存储用户信息
        // 这里不刷新页面，因为SupabaseAuthContext已经处理了刷新
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
      <SupabaseAuthProvider>
        <BrowserRouter>
        <CanonicalHead baseUrl="https://www.veo3-ai.net" />
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
          </Routes>
        </div>
        </BrowserRouter>
      </SupabaseAuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;