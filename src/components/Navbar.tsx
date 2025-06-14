import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, CreditCard, ChevronDown, Video, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import UserMenu from './UserMenu';
import GoogleLoginModal from './GoogleLoginModal';

interface UserData {
  id?: string;
  name?: string;
  email: string;
  picture?: string;
  credits?: number;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  // 使用Supabase Auth Helpers获取会话
  const session = useSession();
  const supabaseClient = useSupabaseClient();

  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // 直接根据URL确定页面状态
  const isHomePage = location.pathname === '/';
  const isVideoEffectsPage = location.pathname === '/video-effects';
  const isPricingPage = location.pathname === '/pricing';
  const isCreateVideoPage = location.pathname === '/create-video';

  // 处理滚动效果
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 当会话变化时更新用户状态
  useEffect(() => {
    const updateUserState = async () => {
      if (session?.user) {
        console.log('Navbar: 检测到有效会话，用户ID:', session.user.id);
        
        try {
          // 从Supabase获取用户资料
          const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('获取用户资料失败:', error);
            
            // 使用会话中的用户信息
            const userData: UserData = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              picture: session.user.user_metadata?.avatar_url,
              credits: 0
            };
            
            setUser(userData);
            
            // 尝试创建用户记录
            const { error: insertError } = await supabaseClient
              .from('users')
              .insert([{
                id: session.user.id,
                email: session.user.email,
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
          } else if (data) {
            // 使用数据库中的用户信息
            setUser({
              id: session.user.id,
              email: session.user.email || data.email || '',
              name: data.name || session.user.user_metadata?.name || 'User',
              picture: data.avatar_url || session.user.user_metadata?.avatar_url,
              credits: data.credits || 0
            });
          }
        } catch (err) {
          console.error('处理用户资料异常:', err);
        }
      } else {
        // 用户未登录，清除状态
        setUser(null);
      }
    };
    
    updateUserState();
  }, [session, supabaseClient]);

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

  // 处理登录
  const handleLogin = () => {
    navigate('/login');
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('登出错误:', error);
      } else {
    setUser(null);
        // 登出后跳转到首页
        navigate('/');
      }
    } catch (error) {
      console.error('登出异常:', error);
    }
  };

  // 检查是否已登录
  const isLoggedIn = !!session;

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-[#0c111b] shadow-md py-3' : 'bg-transparent py-5'}`}>
      <nav className="w-full px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="mr-10 flex items-center">
          <img src="/VEOAI2.svg" alt="VEO AI Logo" className="h-8 w-auto" />
        </Link>
        
        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white p-2 focus:outline-none md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
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
          <div className="relative group">
            <div
              className="flex items-center text-white hover:text-[#8A7CFF] cursor-pointer"
              onMouseEnter={() => setIsToolsMenuOpen(true)}
              onMouseLeave={() => setIsToolsMenuOpen(false)}
            >
              <span className="mr-1">AI Tools</span>
              <ChevronDown size={16} />
            </div>

            <div 
              ref={toolsMenuRef}
              className={`absolute top-full left-0 mt-1 bg-[#1a1e27] rounded-lg shadow-lg py-2 w-48 z-10 transition-opacity duration-150 ${
                isToolsMenuOpen ? 'opacity-100' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
              }`}
              onMouseEnter={() => setIsToolsMenuOpen(true)}
              onMouseLeave={() => setIsToolsMenuOpen(false)}
            >
              <Link 
                to="/create-video"
                className={`flex items-center px-4 py-2 text-sm ${
                  isCreateVideoPage ? 'text-[#8A7CFF]' : 'text-white'
                } hover:bg-[#252a37] transition-colors`}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#2A3541] mr-2">
                  <Video size={14} className="text-[#8A7CFF]" />
                </div>
                <span>Video Generator</span>
              </Link>
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
          {isLoggedIn ? (
            <div className="flex items-center">
              {renderUserCredits()}
              <UserMenu 
                userData={user || {
                  id: session?.user?.id,
                  email: session?.user?.email || 'unknown',
                  name: session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User',
                  picture: session?.user?.user_metadata?.avatar_url
                }} 
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
      <div className="fixed inset-0 z-20 md:hidden bg-[#0c111b]/95 backdrop-blur-sm flex flex-col pt-24 px-6 space-y-8">
        <Link 
          to="/" 
          className={`text-2xl ${isHomePage ? 'text-[#8A7CFF] font-semibold' : 'text-white'}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>
        <div>
          <div 
            onClick={() => {
              navigate('/create-video');
              setIsMenuOpen(false);
            }}
            className={`${isCreateVideoPage ? 'text-[#8A7CFF] font-semibold' : 'text-white'} text-2xl`}
          >
            AI Tools
          </div>
        </div>
        <Link 
          to="/video-effects" 
          className={`text-2xl ${isVideoEffectsPage ? 'text-[#8A7CFF] font-semibold' : 'text-white'}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Video Effects
        </Link>
        <Link 
          to="/pricing" 
          className={`text-2xl ${isPricingPage ? 'text-[#8A7CFF] font-semibold' : 'text-white'}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Pricing
        </Link>
        
        {/* 移动端登录/用户菜单 */}
        {isLoggedIn ? (
          <div className="border-t border-[#343a4d] pt-6 mt-6 space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#343a4d] flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-white font-medium">{user?.name || session?.user?.email?.split('@')[0] || 'User'}</div>
                <div className="text-gray-400 text-sm">{user?.email || session?.user?.email || ''}</div>
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
                handleLogout();
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
              navigate('/login');
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
    </header>
  );
};

export default Navbar;