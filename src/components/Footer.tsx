import React from 'react';
import { Video, Mail} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Video className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Veo3
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              Create lifelike AI videos with Veo 3: dynamic sound effects, clear dialogue, and immersive background audio—all in perfect harmony.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:lmcha310@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#videos" className="text-gray-400 hover:text-white transition-colors">Videos</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>lmcha310@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Veo3-ai. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-sm text-gray-500 space-x-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Back to Home</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;