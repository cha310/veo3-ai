import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoGallery from './components/VideoGallery';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
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
  );
}

export default App;