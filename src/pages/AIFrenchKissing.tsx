import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AIFrenchKissing: React.FC = () => {
  useEffect(() => {
    // 设置页面标题
    document.title = 'AI French Kissing - Turn Photos into Kissing Videos - Veo 3 AI';
    
    // 设置canonical标签
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', 'https://www.veo3-ai.net/ai-french-kissing');
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
        {/* 英雄区域 */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              AI French Kiss Video Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Turn your photos into romantic French kissing videos with one click using our advanced AI technology
            </p>
          </div>
          
          {/* 视频展示区域 */}
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl mb-12">
            <div className="relative aspect-video bg-black">
              <video 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted 
                poster="/images/french-kiss-poster.jpg"
              >
                <source src="/videos/use-ai-french-kiss-video-generator-to-convert-images-to-kissing-videos-in-one-click.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-6">
                <button className="px-8 py-3 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg text-lg font-medium hover:shadow-lg hover:shadow-[#8A7CFF]/30 transition-all">
                  Try It Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 特点介绍区域 */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Create Romantic AI Kissing Videos in Seconds
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              No technical skills required. Simply upload a photo and let our AI do the magic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a242f] p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">One-Click Generation</h3>
              <p className="text-gray-300">
                Upload a photo and create a realistic French kissing video with just one click.
              </p>
            </div>
            
            <div className="bg-[#1a242f] p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">High-Quality Results</h3>
              <p className="text-gray-300">
                Our AI produces smooth, natural-looking videos with realistic movements and expressions.
              </p>
            </div>
            
            <div className="bg-[#1a242f] p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Privacy Protected</h3>
              <p className="text-gray-300">
                All uploads are processed securely and privately. Your content is never shared or stored.
              </p>
            </div>
          </div>
        </div>

        {/* 使用步骤 */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              How to Create Your AI French Kissing Video
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Follow these simple steps to turn your photos into romantic kissing videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a242f] p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#1a242f] border-2 border-[#8A7CFF] text-white flex items-center justify-center mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload Your Photo</h3>
              <p className="text-gray-300">
                Select a clear portrait photo with good lighting and a neutral expression.
              </p>
            </div>
            
            <div className="bg-[#1a242f] p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#1a242f] border-2 border-[#8A7CFF] text-white flex items-center justify-center mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Customize (Optional)</h3>
              <p className="text-gray-300">
                Adjust settings like intensity and style to personalize your kissing video.
              </p>
            </div>
            
            <div className="bg-[#1a242f] p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#1a242f] border-2 border-[#8A7CFF] text-white flex items-center justify-center mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Generate & Download</h3>
              <p className="text-gray-300">
                Click "Generate" and download your AI French kissing video when it's ready.
              </p>
            </div>
          </div>
        </div>

        {/* 示例展示 */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Examples of AI French Kissing Videos
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              See the incredible results our users have created with our AI French Kiss generator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 示例 1 */}
            <div className="bg-[#1a242f] rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800">
                <video 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  loop 
                  muted
                  poster="/images/french-kiss-gif.jpg"
                >
                  <source src="/videos/use-ai-french-kiss-video-generator-to-convert-images-to-kissing-videos-in-one-click.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">Romantic Couple Kiss</h3>
              </div>
            </div>
            
            {/* 示例 2 */}
            <div className="bg-[#1a242f] rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800">
                <video 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  loop 
                  muted
                  poster="/images/convert-image-to-french-kiss-video.jpg"
                >
                  <source src="/videos/use-ai-french-kiss-video-generator-to-convert-images-to-kissing-videos-in-one-click.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">Passionate French Kiss</h3>
              </div>
            </div>
            
            {/* 示例 3 */}
            <div className="bg-[#1a242f] rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800">
                <video 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  loop 
                  muted
                  poster="/images/realistic-kiss-video.jpg"
                >
                  <source src="/videos/use-ai-french-kiss-video-generator-to-convert-images-to-kissing-videos-in-one-click.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">Sweet Kiss Moment</h3>
              </div>
            </div>
          </div>
        </div>

        {/* 行动号召区域 */}
        <div className="container mx-auto px-4 mb-16">
          <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Create Your AI French Kissing Video Today
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
              Join thousands of users who have already created stunning AI kissing videos with our technology
            </p>
            <Link to="/text-to-video">
              <button className="px-8 py-4 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg text-lg font-medium hover:shadow-lg hover:shadow-[#8A7CFF]/30 transition-all">
                Try AI French Kiss Generator Now
              </button>
            </Link>
            <p className="text-gray-400 mt-4">No credit card required • Free to try</p>
          </div>
        </div>

        {/* FAQ部分 */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-gray-700">
            <div className="py-6">
              <h3 className="text-xl font-medium text-white mb-2">How does the AI French Kiss generator work?</h3>
              <p className="text-gray-300">
                Our AI French Kiss generator uses advanced neural networks to analyze your photo and animate it, creating realistic kissing movements and expressions. The technology seamlessly transforms static images into lifelike videos.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-medium text-white mb-2">What kind of photos work best?</h3>
              <p className="text-gray-300">
                Clear portrait photos with good lighting and a neutral expression work best. The face should be clearly visible with minimal obstruction. Photos looking directly at the camera tend to produce the most realistic results.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-medium text-white mb-2">Is my content private and secure?</h3>
              <p className="text-gray-300">
                Yes, your privacy is our priority. All uploaded photos are processed securely and are never shared with third parties. We do not store your photos or the generated videos beyond the processing time needed to create your video.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-medium text-white mb-2">How long does it take to generate a video?</h3>
              <p className="text-gray-300">
                Most videos are generated within 30-60 seconds, depending on server load and the complexity of the photo. Once processing is complete, you can immediately download your video.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-medium text-white mb-2">Can I use the generated videos commercially?</h3>
              <p className="text-gray-300">
                Yes, you have full rights to use your generated videos for both personal and commercial purposes, as long as you have the appropriate rights to the original photo you uploaded.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIFrenchKissing; 