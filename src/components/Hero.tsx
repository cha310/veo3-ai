import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#15202B] text-white">
      <div className="container mx-auto">
        <div className="max-w-8xl mx-auto text-center">
          <h1 className="flex flex-wrap justify-center items-center text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="inline-block">AI Video Generation with Realistic Sound</span>
            <span className="inline-block mx-1">&nbsp;</span>
            <span className="inline-block bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">
              Veo3
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
            Produce cinematic videos with perfectly timed audio—sound effects, voiceovers, and atmospheric sounds all in sync. Transform your ideas into vivid stories with Veo3.
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