import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const [videoError, setVideoError] = useState(false);

  // 检测视频是否可用
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      video.addEventListener('error', () => {
        setVideoError(true);
      });
    }
    return () => {
      if (video) {
        video.removeEventListener('error', () => {
          setVideoError(true);
        });
      }
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* 视频背景 */}
      <div className="absolute inset-0 w-full h-full z-0">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
          >
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>
        ) : (
          // 备选方案：渐变背景
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#121a22] to-[#1c2736]"></div>
        )}
        {/* 透明黑色覆盖层 */}
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      {/* 内容 */}
      <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-white">
        <div className="max-w-8xl mx-auto text-center">
          <h1 className="flex flex-wrap justify-center items-center text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="inline-block">Veo 3 AI Video Generator
               </span>
            <span className="inline-block mx-1">&nbsp;</span>
            <span className="inline-block bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">
              with Realistic Sound
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-[65ch] mx-auto">
            Veo3 AI, the latest breakthrough from Google Veo. With Veo3 AI, generate videos featuring synchronized sound, dialogue, and music—all from a simple prompt. Create cinematic scenes, lifelike characters, and dynamic animations powered by Veo3 AI's advanced tracking, native audio, and realistic physics. Integrated with Imagen 4 and Flow, Veo3 AI transforms your creative vision into stunning reality.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/create-video" 
              className="relative px-10 py-4 text-lg rounded-lg font-medium text-white overflow-hidden group bg-[#6C5CE7] transition-all duration-300 hover:shadow-[0_0_25px_rgba(138,124,255,0.7)] hover:-translate-y-1"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] transition-all duration-300 group-hover:scale-[1.15] group-hover:rotate-[4deg]"></span>
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#6C5CE7]/0 via-white/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">Try Now</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;