import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VideoEffects: React.FC = () => {
  useEffect(() => {
    // 设置页面标题
    document.title = 'AI Video Effects & Templates - Veo 3 AI';
    
    // 设置canonical标签
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', 'https://www.veo3-ai.net/video-effects');
    }

    // 组件卸载时恢复默认标题
    return () => {
      document.title = 'Veo 3 AI - Try Google Veo 3 AI Video Model Now - Video Generation AI - VEOAI';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121a22]">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
            AI Video Effects & Templates
          </h1>
          
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 导航选项卡 */}
              <div className="col-span-full mb-14 overflow-x-auto pt-8">
                <div className="flex min-w-max space-x-4 md:space-x-6 pb-2">
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all">All</button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all relative">
                    Interaction
                    <span className="absolute -top-4 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  </button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all relative">
                    Appearance
                    <span className="absolute -top-4 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  </button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all relative">
                    Emotions
                    <span className="absolute -top-4 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  </button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all relative">
                    Entertainment
                    <span className="absolute -top-4 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  </button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all relative">
                    Hero/Villain
                    <span className="absolute -top-4 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  </button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all">Horror/Fantasy</button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all">Xmas</button>
                  <button className="px-4 py-2 text-white bg-[#1a242f] rounded-full text-sm font-medium hover:bg-[#2a3441] transition-all relative">
                    Others
                    <span className="absolute -top-4 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  </button>
                </div>
              </div>
              
              {/* 视频特效卡片 - 这里可以放置各种视频特效案例 */}
              <div className="bg-[#1a242f] rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all">
                <Link to="/ai-french-kissing">
                  <div className="relative aspect-video bg-gray-800">
                    {/* 视频/图片位置 */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <video 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        poster="/images/french-kiss-poster.jpg"
                      >
                        <source src="/videos/use-ai-french-kiss-video-generator-to-convert-images-to-kissing-videos-in-one-click.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Hot</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium text-lg">AI French Kissing</h3>
                  </div>
                </Link>
              </div>

              <div className="bg-[#1a242f] rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all">
                <Link to="/asmr-video">
                  <div className="relative aspect-video bg-gray-800">
                    {/* 视频/图片位置 */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        poster="/images/ai-animation-generator.jpg"
                      >
                        <source src="/videos/asmr1.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium text-lg">Veo3 ASMR Video</h3>
                  </div>
                </Link>
              </div>

              {/* 创建视频特效的横幅 */}
              <div className="col-span-full my-8">
                <div className="relative bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-lg overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:max-w-[60%] mb-6 md:mb-0">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Create AI Video Effects Instantly</h2>
                      <p className="text-gray-300">Upload a photo to our AI video generator and create amazing video effects with just one click. Try our advanced video effects for free!</p>
                      <button className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all">
                        Create AI Video Now
                      </button>
                    </div>
                    <div className="relative w-full md:w-[40%] aspect-video rounded-lg overflow-hidden bg-gray-800">
                      {/* 这里放置横幅视频或图片 */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <video 
                          className="w-full h-full object-cover" 
                          autoPlay 
                          loop 
                          muted
                        >
                          <source src="/videos/asmr3.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoEffects; 