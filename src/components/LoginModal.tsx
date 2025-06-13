import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { X } from 'lucide-react';

// 不要在这里设置AppElement，因为在服务器渲染时会出错
// Do not set AppElement here because it causes errors during server-side rendering

interface LoginModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [error, setError] = useState<string | null>(null);
  const supabaseClient = useSupabaseClient();
  
  useEffect(() => {
    // 重置错误状态
    // Reset error state
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
      contentLabel="Login Modal"
    >
      <div className="bg-[#1a1e27] rounded-lg shadow-xl w-full max-w-md relative">
        <button 
          onClick={onRequestClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Log In / Sign Up</h2>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded mb-4">
              {error}
          </div>
        )}

          <Auth
            supabaseClient={supabaseClient}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8A7CFF',
                    brandAccent: '#6C5CE7',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            magicLink={true}
            theme="dark"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email Address',
                  password_label: 'Password',
                  button_label: 'Log In',
                  link_text: 'Already have an account? Log In',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                },
                sign_up: {
                  email_label: 'Email Address',
                  password_label: 'Password',
                  button_label: 'Sign Up',
                  link_text: "Don't have an account? Sign Up",
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Create a password',
                },
                magic_link: {
                  button_label: 'Sign in with Magic Link',
                  link_text: 'Sign in via email magic link',
                },
                forgotten_password: {
                  email_label: 'Email Address',
                  button_label: 'Send reset instructions',
                  link_text: 'Forgot password?',
                  email_input_placeholder: 'Your email address',
                },
              },
            }}
          />
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>By logging in, you agree to our</p>
            <p>
              <a href="/terms-of-service" className="text-[#8A7CFF] hover:underline">
                Terms of Service
              </a>{' '}
               and{' '}
              <a href="/privacy-policy" className="text-[#8A7CFF] hover:underline">
                Privacy Policy
              </a>
          </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal; 