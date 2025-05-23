import React, { useState, useEffect } from 'react';
import { Menu, X, Video } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePage, setActivePage] = useState('home');

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#1E2732]/95 backdrop-blur-md shadow-md' : 'bg-[#1E2732]'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Video className="h-8 w-8 text-[#8A7CFF]" />
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent">
            Veo3
          </span>
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
          <a 
            href="#" 
            onClick={() => setActivePage('about')}
            className={`transition-colors ${
              activePage === 'about' 
                ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                : 'text-white hover:text-[#8A7CFF]'
            }`}
          >
            About
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-[#8A7CFF] transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#1E2732] shadow-lg md:hidden py-4">
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
              <a 
                href="#" 
                onClick={() => {
                  setActivePage('about');
                  setIsMenuOpen(false);
                }}
                className={`transition-colors ${
                  activePage === 'about' 
                    ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent font-medium' 
                    : 'text-white hover:text-[#8A7CFF]'
                }`}
              >
                About
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;