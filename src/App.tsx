import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoGallery from './components/VideoGallery';
import Features from './components/Features';
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

// Google OAuth 客户端ID
const GOOGLE_CLIENT_ID = '1049691614917-7ncrqa4qmmg4oiamn8i1dfbrvphicoju.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
          </Routes>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;