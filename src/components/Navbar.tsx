import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import LoginModal from './LoginModal';

interface UserData {
  name?: string;
  email: string;
  picture?: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#121a22]/95 backdrop-blur-md shadow-md' : 'bg-[#121a22]'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/VEOAI2.svg" alt="Veo3 AI Logo" className="h-6 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <a 
            href="#" 
            onClick={() => setActivePage('home')}
            className={`transition-colors ${
              activePage === 'home' 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            Home
          </a>
          <a 
            href="#videos" 
            onClick={() => setActivePage('videos')}
            className={`transition-colors ${
              activePage === 'videos' 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            Videos
          </a>
          <a 
            href="#" 
            onClick={() => setActivePage('features')}
            className={`transition-colors ${
              activePage === 'features' 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            Features
          </a>
          
          {/* 登录按钮或用户头像 */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#6C5CE7]">
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
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-1.5 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all flex items-center gap-2"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {user ? (
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="mr-3"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#6C5CE7]">
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
              <a 
                href="#" 
                onClick={() => {
                  setActivePage('home');
                  setIsMenuOpen(false);
                }}
                className={`transition-colors ${
                  activePage === 'home' 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                Home
              </a>
              <a 
                href="#videos" 
                onClick={() => {
                  setActivePage('videos');
                  setIsMenuOpen(false);
                }}
                className={`transition-colors ${
                  activePage === 'videos' 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                Videos
              </a>
              <a 
                href="#" 
                onClick={() => {
                  setActivePage('features');
                  setIsMenuOpen(false);
                }}
                className={`transition-colors ${
                  activePage === 'features' 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                Features
              </a>
              
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