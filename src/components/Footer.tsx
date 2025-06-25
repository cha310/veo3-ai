import React from 'react';
import { Mail} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  // 处理AI Video Generator链接点击事件，确保页面滚动到顶部
  const handleVideoGeneratorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 防止默认行为
    event.preventDefault();
    
    // 导航到create-video页面
    window.location.href = '/create-video';
    
    // 确保页面滚动到顶部（虽然新页面加载时通常会自动滚动到顶部，这是一个额外保障）
    window.scrollTo(0, 0);
  };

  // 处理Back to Home链接点击事件，确保页面滚动到顶部
  const handleBackToHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 防止默认行为
    event.preventDefault();
    
    // 导航到首页
    window.location.href = '/';
    
    // 确保页面滚动到顶部
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-[#000000] text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/VEOAI2.svg" alt="Veo3 AI Logo" className="h-6 w-auto" />
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              Create lifelike AI videos with Veo 3: dynamic sound effects, clear dialogue, and immersive background audio—all in perfect harmony.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:support@veo3-ai.net" className="text-gray-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">PLATFORM</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <a 
                  href="/create-video" 
                  onClick={handleVideoGeneratorClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  AI Video Generator
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">LEGAL</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Refund Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">CONTACT</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@veo3-ai.net" className="text-gray-400 hover:text-white transition-colors">support@veo3-ai.net</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Veo3-ai. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-sm text-gray-500 space-x-4">
            <a href="/" onClick={handleBackToHomeClick} className="hover:text-gray-300 transition-colors">Back to Home</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;