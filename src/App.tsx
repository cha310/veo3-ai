import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoGallery from './components/VideoGallery';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#15202B]">
      <Navbar />
      <main>
        <Hero />
        <VideoGallery />
      </main>
      <Footer />
    </div>
  );
}

export default App;