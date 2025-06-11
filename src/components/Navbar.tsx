import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, LogOut, User, CreditCard, ChevronDown, Video } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';

interface UserData {
  name?: string;
  email: string;
  picture?: string;
  credits?: number;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // 直接根据URL确定页面状态
  const isHomePage = location.pathname === '/';
  const isVideoEffectsPage = location.pathname === '/video-effects';
  const isPricingPage = location.pathname === '/pricing';
  const isCreateVideoPage = location.pathname === '/create-video';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // 检查本地存储中的用户数据
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('解析用户数据错误:', error);
        localStorage.removeItem('user');
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);
    window.location.reload();
  };

  // 显示用户积分
  const renderUserCredits = () => {
    if (!user) return null;
    
    return (
      <div className="flex items-center text-white text-sm mr-3">
        <CreditCard size={16} className="text-[#8A7CFF] mr-1" />
        <span className="text-[#8A7CFF] font-medium">{user.credits || 0}</span>
      </div>
    );
  };

  // 处理页面跳转并滚动到顶部
  const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    window.location.href = path;
    window.scrollTo(0, 0);
    setIsToolsMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#121a22]/95 backdrop-blur-md shadow-md' : 'bg-[#121a22]'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
          <img src="/VEOAI2.svg" alt="Veo3 AI Logo" className="h-6 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`transition-colors py-1.5 ${
              isHomePage 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            Home
          </Link>
          
          {/* AI Tools 下拉菜单 - 鼠标悬浮 */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsToolsMenuOpen(true)}
            onMouseLeave={() => {
              // 添加延迟，防止鼠标移动过程中菜单立即消失
              setTimeout(() => {
                if (!toolsMenuRef.current?.matches(':hover')) {
                  setIsToolsMenuOpen(false);
                }
              }, 100);
            }}
          >
            {/* 无论如何，只要URL是/create-video，就强制使用紫色渐变，但要确保图标可见 */}
            <div className="flex items-center transition-colors py-1.5 cursor-pointer">
              <span className={isCreateVideoPage 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white'
              }>
                AI Tools
              </span>
              <ChevronDown 
                size={16} 
                className={`ml-1 transition-transform ${
                  isToolsMenuOpen ? 'rotate-180' : ''
                } ${
                  isCreateVideoPage ? 'text-[#8A7CFF]' : 'text-white'
                }`} 
              />
            </div>
            
            <div 
              ref={toolsMenuRef}
              className={`absolute top-full left-0 mt-1 bg-[#1a1e27] rounded-lg shadow-lg py-2 w-48 z-10 transition-opacity duration-150 ${
                isToolsMenuOpen ? 'opacity-100' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
              }`}
              onMouseEnter={() => setIsToolsMenuOpen(true)}
              onMouseLeave={() => setIsToolsMenuOpen(false)}
            >
              <a 
                href="/create-video"
                onClick={(e) => handleNavigate(e, '/create-video')}
                className={`flex items-center px-4 py-2 text-sm ${
                  isCreateVideoPage ? 'text-[#8A7CFF]' : 'text-white'
                } hover:bg-[#252a37] transition-colors`}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#2A3541] mr-2">
                  <Video size={14} className="text-[#8A7CFF]" />
                </div>
                <span>Video Generator</span>
              </a>
            </div>
          </div>
          
          <Link 
            to="/video-effects" 
            className={`transition-colors py-1.5 ${
              isVideoEffectsPage 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            Video Effects
          </Link>
          <Link 
            to="/pricing" 
            className={`transition-colors py-1.5 ${
              isPricingPage 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            Pricing
          </Link>
          
          {/* 登录按钮或用户头像 */}
          {user ? (
            <div className="flex items-center">
              {renderUserCredits()}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#6C5CE7] flex items-center justify-center text-white">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                </button>
                
                {/* 用户下拉菜单 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1e27] rounded-lg shadow-lg py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <CreditCard size={14} className="text-[#8A7CFF] mr-1" />
                        <p className="text-xs text-[#8A7CFF]">{user.credits || 0} credits</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#252a37] flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-1.5 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all flex items-center gap-2"
            >
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {user ? (
            <>
              {renderUserCredits()}
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="mr-3"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#6C5CE7] flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                  )}
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="mr-3 p-1.5 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all"
            >
              <LogIn size={18} />
            </button>
          )}
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-[#8A7CFF] transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#121a22] shadow-lg md:hidden py-4">
            <div className="flex flex-col space-y-4 px-4">
              <Link 
                to="/" 
                className={`transition-colors ${
                  isHomePage 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                Home
              </Link>
              
              {/* 移动端 AI Tools 菜单 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={isCreateVideoPage ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' : 'text-white'}>AI Tools</span>
                  <ChevronDown size={14} className={isCreateVideoPage ? 'text-[#8A7CFF]' : 'text-white'} />
                </div>
                <div className="pl-4 border-l border-gray-700 space-y-2">
                  <a 
                    href="/create-video"
                    onClick={(e) => handleNavigate(e, '/create-video')}
                    className={`flex items-center text-sm ${
                      isCreateVideoPage 
                        ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                        : 'text-white hover:text-[#8A7CFF]'
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2A3541] mr-2">
                      <Video size={12} className="text-[#8A7CFF]" />
                    </div>
                    <span>Video Generator</span>
                  </a>
                </div>
              </div>
              
              <Link 
                to="/video-effects" 
                className={`transition-colors ${
                  isVideoEffectsPage 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                Video Effects
              </Link>
              <Link 
                to="/pricing" 
                className={`transition-colors ${
                  isPricingPage 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                Pricing
              </Link>
              
              {/* 移动端登出选项 */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-left text-white hover:text-[#8A7CFF] flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* 用户菜单（移动端） */}
        {isUserMenuOpen && user && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-[#1a1e27] rounded-lg shadow-lg py-2 z-10 md:hidden">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <div className="flex items-center mt-1">
                <CreditCard size={14} className="text-[#8A7CFF] mr-1" />
                <p className="text-xs text-[#8A7CFF]">{user.credits || 0} credits</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#252a37] flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </nav>

      {/* 登录模态框 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onRequestClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;