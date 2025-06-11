import React, { useState, useRef, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface UserMenuProps {
  userData: {
    name?: string;
    picture?: string;
    email: string;
    credits?: number;
  };
}

const UserMenu: React.FC<UserMenuProps> = ({ userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useSupabaseAuth();
  
  // 处理点击事件
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 处理登出
  const handleSignOut = async () => {
    try {
      await signOut();
      // 注意：登出后页面会自动刷新，这是在signOut函数中处理的
    } catch (error) {
      console.error('登出失败:', error);
    }
  };
  
  return (
    <div className="relative" ref={menuRef}>
      {/* 用户头像按钮 */}
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500">
          <img 
            src={userData.picture || 'https://via.placeholder.com/40'} 
            alt={userData.name || 'User'} 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="hidden md:inline text-white">{userData.name || userData.email.split('@')[0]}</span>
      </button>
      
      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1e27] rounded-lg shadow-xl z-20 py-2 border border-[#343a4d]">
          {/* 用户信息 */}
          <div className="px-4 py-2 border-b border-[#343a4d]">
            <p className="text-sm text-white font-medium truncate">{userData.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{userData.email}</p>
          </div>
          
          {/* 积分信息 */}
          <div className="px-4 py-2 border-b border-[#343a4d]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Credits:</span>
              <span className="text-sm font-bold text-white">{userData.credits || 0}</span>
            </div>
          </div>
          
          {/* 菜单选项 */}
          <a 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#252a37] hover:text-white"
          >
            Profile
          </a>
          <a 
            href="/settings" 
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#252a37] hover:text-white"
          >
            Settings
          </a>
          <button 
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#252a37]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 