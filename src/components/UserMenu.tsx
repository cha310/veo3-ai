import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface UserData {
  id?: string;
  name?: string;
  email: string;
  picture?: string;
  credits?: number;
}

export interface UserMenuProps {
  userData: UserData;
  onLogout: () => Promise<void>;
}

const UserMenu: React.FC<UserMenuProps> = ({ userData, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    try {
      await onLogout();
      setIsOpen(false);
    } catch (error) {
      console.error('登出错误:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {userData.picture ? (
            <img 
              src={userData.picture} 
              alt={userData.name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#343a4d] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1e27] rounded-lg shadow-lg py-2 z-10">
          <div className="px-4 py-2 border-b border-[#343a4d]">
            <div className="text-white font-medium truncate">{userData.name || userData.email.split('@')[0]}</div>
            <div className="text-gray-400 text-xs truncate">{userData.email}</div>
          </div>
          
          <Link 
            to="/profile" 
            className="block px-4 py-2 text-white hover:bg-[#252a37] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          
          <Link 
            to="/settings" 
            className="block px-4 py-2 text-white hover:bg-[#252a37] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <Settings size={14} className="mr-2" />
              <span>Settings</span>
            </div>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[#252a37] transition-colors"
          >
            <div className="flex items-center">
              <LogOut size={14} className="mr-2" />
              <span>Sign out</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 