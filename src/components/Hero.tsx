import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="pt-80 pb-20 px-4 sm:px-6 lg:px-8 bg-[#121a22] text-white">
      <div className="container mx-auto">
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
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#videos"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] hover:opacity-90 transition-all duration-300 text-white font-medium"
            >
              Try Now
            </a>
            <a
              href="#"
              className="px-8 py-3 rounded-lg bg-transparent border border-[#8A7CFF] hover:bg-gradient-to-r hover:from-[#8A7CFF]/20 hover:to-[#6C5CE7]/20 transition-all duration-300 text-white font-medium"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;