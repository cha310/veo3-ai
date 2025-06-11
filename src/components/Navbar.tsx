import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, LogOut, User, CreditCard, ChevronDown, Video } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import supabase from '../lib/supabase.ts';

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
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const { user: supabaseUser } = useSupabaseAuth();

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

  // 检查Supabase认证状态
  useEffect(() => {
    console.log('Supabase认证状态检查 - supabaseUser:', supabaseUser);
    
    // 每次检查都尝试重新获取会话，以确保状态最新
    const refreshAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('发现有效会话:', session.user);
        }
      } catch (err) {
        console.error('获取会话错误:', err);
      }
    };
    
    refreshAuthStatus();
    
    if (supabaseUser) {
      console.log('Supabase用户已登录:', supabaseUser);
      
      // 从Supabase获取用户资料
      const fetchUserProfile = async () => {
        try {
          // 首先尝试从users表获取资料
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          
          if (error) {
            console.error('获取用户资料失败:', error);
            
            // 如果从表中获取失败，直接使用Supabase Auth用户信息
            const userData = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
              picture: supabaseUser.user_metadata?.avatar_url,
              credits: 0
            };
            
            console.log('使用Auth用户信息:', userData);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // 尝试创建用户记录
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                id: supabaseUser.id,
                email: supabaseUser.email,
                name: userData.name,
                avatar_url: userData.picture,
                provider: 'google',
                credits: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            
            if (insertError) {
              console.error('创建用户记录失败:', insertError);
            }
            
            return;
          }
          
          if (data) {
            // 确保本地用户数据与Supabase保持同步
            const updatedUserData = {
              id: supabaseUser.id,
              email: supabaseUser.email || data.email || '',
              name: data.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
              picture: data.avatar_url || supabaseUser.user_metadata?.avatar_url,
              credits: data.credits || 0
            };
            
            console.log('使用数据库用户信息:', updatedUserData);
            setUser(updatedUserData);
            localStorage.setItem('user', JSON.stringify(updatedUserData));
          }
        } catch (error) {
          console.error('获取用户资料异常:', error);
        }
      };
      
      fetchUserProfile();
    } else {
      // 检查localStorage是否有用户信息，但Supabase认证已失效
      const userData = localStorage.getItem('user');
      if (userData) {
        // 存在不一致状态，清除本地存储
        console.log('检测到不一致状态：本地有用户数据但Supabase无认证');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, [supabaseUser]);

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
          {supabaseUser || user ? (
            <div className="flex items-center">
              {renderUserCredits()}
              <UserMenu userData={user || {
                email: supabaseUser?.email || 'unknown',
                name: supabaseUser?.user_metadata?.name || supabaseUser?.email?.split('@')[0] || 'User',
                picture: supabaseUser?.user_metadata?.avatar_url
              }} />
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          {user && renderUserCredits()}
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
        {isMenuOpen && (
        <div className="md:hidden bg-[#1a1e27] shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-4">
              <Link 
                to="/" 
              className={`block py-2 ${
                isHomePage ? 'text-[#8A7CFF] font-medium' : 'text-white'
                }`}
              onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            <div>
              <div 
                onClick={() => {
                  window.location.href = '/create-video';
                  setIsMenuOpen(false);
                }}
                className={`block py-2 ${
                  isCreateVideoPage ? 'text-[#8A7CFF] font-medium' : 'text-white'
                }`}
              >
                AI Tools
              </div>
            </div>
              <Link 
                to="/video-effects" 
              className={`block py-2 ${
                isVideoEffectsPage ? 'text-[#8A7CFF] font-medium' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Video Effects
            </Link>
            <Link 
              to="/pricing" 
              className={`block py-2 ${
                isPricingPage ? 'text-[#8A7CFF] font-medium' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {/* 移动端登录/用户菜单 */}
            {user ? (
              <div className="border-t border-[#343a4d] pt-4 mt-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#343a4d] flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.name || user.email.split('@')[0]}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                
                <Link 
                  to="/profile" 
                  className="block py-2 text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <Link 
                  to="/settings" 
                  className="block py-2 text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                
                <button 
                  onClick={() => {
                    // 使用Supabase Auth Context的登出功能
                    const { signOut } = useSupabaseAuth();
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-red-400 w-full text-left"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="block w-full bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity mt-4"
                >
                Login
                </button>
              )}
            </div>
          </div>
        )}

      {/* 登录模态框 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onRequestClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;