import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper: extract twitter/x username from URL
const getUsernameFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return parts[0];
    }
  } catch (e) {}
  return null;
};

const getAvatarUrl = (url: string): string => {
  const username = getUsernameFromUrl(url);
  if (username) {
    return `https://unavatar.io/${username}`; // unavatar supports twitter/x username
  }
  return 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
};

interface Example {
  prompt: string;
  video: string;
}

const examples: Example[] = [
  {
    prompt:
      'Macro-shot ASMR video: a glowing lava cube wrapped in a dark, hardened basalt crust rests on a scorched stone slab. A razor-sharp stainless-steel knife slowly pierces and slices through the brittle shell; as the blade breaks the crust, incandescent lava gushes out and spreads, bubbling and sizzling against the cool surface. Ultra-slow-motion (4 s) in 4 K, cinematic rim lighting, rich shadows, shallow depth of field, crisp sizzling and crackling audio, no text or logos.',
    video: '/videos/asmr1.mp4',
  },
  {
    prompt:
      "An ASMR video capturing a close-up, first-person perspective of slicing a translucent glass tomato with a sharp chef's knife on a wooden cutting board. The tomato is glossy, with delicate, shimmering seeds suspended inside, reflecting soft light.",
    video: '/videos/asmr2.mp4',
  },
  {
    prompt:
      'A snow-covered plain of iridescent moon-dust under twilight skies. Thirty-foot crystalline flowers bloom, refracting light into slow-moving rainbows. A fur-cloaked figure walks between these colossal blossoms, leaving the only footprints in untouched dust.',
    video: '/videos/asmr3.mp4',
  },
];

// 添加滚动动画组件
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { 
        threshold: 0.05, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );
    
    observer.observe(el);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ 
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        opacity: visible ? 1 : 0,
        transition: `transform 800ms ease-out, opacity 800ms ease-out`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// 卡片组件，进入视口时淡入上滑
const ObservedCard: React.FC<{ example: Example; idx: number }> = ({ example, idx }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // Default to playing since we're autoplaying
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Start playing the video when it comes into view
          if (videoRef.current) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 } // Increase threshold to trigger animation when more of the element is visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
  };

  return (
    <div
      ref={ref}
      className={`relative transform transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${idx * 200}ms` }} // Staggered animation based on index
    >
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* 左侧 - 视频 */}
        <div className={`relative aspect-video rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 ${visible ? 'translate-x-0' : 'translate-x-[-50px]'}`}>
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            loop
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          >
            <source src={example.video} type="video/mp4" />
          </video>
          
          {/* 视频悬停效果和静音提示 */}
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onClick={handleUnmute}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          
          {/* 静音指示器 */}
          <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2 cursor-pointer" onClick={handleUnmute}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          </div>
        </div>

        {/* 右侧 - 特性说明 */}
        <div className={`flex flex-col transform transition-all duration-700 delay-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'}`}>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">
              {idx === 0 ? 'Macro-shot ASMR video' : idx === 1 ? 'Glass tomato ASMR video' : 'Egg cracking ASMR video'}
            </span>
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            {idx === 0 
              ? 'a glowing lava cube wrapped in a dark, hardened basalt crust rests on a scorched stone slab. A razor-sharp stainless-steel knife slowly pierces and slices through the brittle shell; as the blade breaks the crust, incandescent lava gushes out and spreads, bubbling and sizzling against the cool surface. Ultra-slow-motion (4 s) in 4 K, cinematic rim lighting, rich shadows, shallow depth of field, crisp sizzling and crackling audio, no text or logos.' 
              : idx === 1 
              ? "An ASMR video capturing a close-up, first-person perspective of slicing a translucent glass tomato with a sharp chef's knife on a wooden cutting board. The tomato is glossy, with delicate, shimmering seeds suspended inside, reflecting soft light."
              : 'A photorealistic, 4K cinematic ASMR video with a yeti cracking eggs into a bowl. The video captures the crisp sound of eggshells breaking and the satisfying plop of yolks falling. Perfect for relaxation and tingling sensations.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const ASMRVideo: React.FC = () => {
  useEffect(() => {
    // 设置页面标题
    document.title = 'Veo3 ASMR Videos - Native Audio Generation - Veo 3 AI';

    // 设置 canonical 标签
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', 'https://www.veo3-ai.net/asmr-video');
    }

    return () => {
      document.title = 'Veo 3 AI - Try Google Veo 3 AI Video Model Now - Video Generation AI - VEOAI';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121a22]">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* 页面标题区域 - 更现代的设计 */}
          <ScrollReveal>
            <div className="text-center mb-32">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">
                Create ASMR Videos with VEO3 Generator
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
              Immerse yourself in the future of sound with VEOAI revolutionary AI. This advanced generator intuitively grasps your vision, producing high-quality content with seamless audio-visual harmony for an unparalleled tingling sensation. Elevate your ASMR game and create professionally relaxing AI content that competes with YouTube's elite, all powered by VEOAI innovation.
              </p>
            </div>
          </ScrollReveal>

          {/* 特性展示区域 - 左右交替布局 */}
          <div className="space-y-40 mb-32">
            {examples.map((item, idx) => (
              <ObservedCard key={idx} example={item} idx={idx} />
            ))}
          </div>

          {/* ASMR 定义说明 - 移除背景框，增大字体 */}
          <ScrollReveal delay={200}>
            <div className="mt-32 max-w-5xl mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 text-center bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">
                What's an ASMR Video?
              </h2>
              <p className="text-gray-300 leading-relaxed text-xl md:text-2xl text-center">
                An ASMR video is content that helps viewers feel calm or pleasantly &quot;tingly&quot; through specific sounds and visuals. ASMR videos feature soft, repetitive sounds like whispering, tapping, and crinkling, which trigger a unique response that many people find soothing. Instead of flashy effects or attention-grabbing visuals, ASMR videos create a gentle, intimate experience that feels almost like a personal interaction.
              </p>
              <p className="text-gray-300 leading-relaxed text-xl md:text-2xl text-center mt-8">
                These videos come in many forms, from simple sound-focused clips to elaborate role-plays like spa sessions or cozy cooking scenes. No matter the delivery, the goal remains the same — to provide a sensory experience that helps viewers unwind and find comfort.
              </p>
            </div>
          </ScrollReveal>

          {/* 行动号召区域 */}
          <ScrollReveal delay={400}>
            <div className="mt-32 mb-12">
              <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                      Create Your Own ASMR Videos
                    </h2>
                    <p className="text-gray-300 text-lg mb-8">
                      Generate immersive ASMR videos with realistic sound effects and visuals using our advanced AI technology. No technical skills required.
                    </p>
                    <div>
                      <Link to="/create-video">
                        <button className="px-8 py-4 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg text-lg font-medium hover:shadow-lg hover:shadow-[#8A7CFF]/30 transition-all">
                          Create ASMR Video Now
                        </button>
                      </Link>
                    </div>
                  </div>
                  <div className="relative aspect-video bg-black/20 rounded-xl overflow-hidden">
                    <video 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      loop 
                      muted
                    >
                      <source src="/videos/asmr1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-6">
                      <span className="text-white text-xl font-medium">Ready in seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ASMRVideo; 