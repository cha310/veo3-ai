import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoGallery from './components/VideoGallery';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

// Google OAuth 客户端ID
const GOOGLE_CLIENT_ID = '1049691614917-7ncrqa4qmmg4oiamn8i1dfbrvphicoju.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-[#121a22]">
        <Navbar />
        <main>
          <Hero />
          <VideoGallery />
          <Features />
          <FAQ />
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;