import React from 'react';
import Modal from 'react-modal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { X } from 'lucide-react';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({ isOpen, onRequestClose }) => {
  const supabaseClient = useSupabaseClient();

  const handleGoogleLogin = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { skipBrowserRedirect: true },
    });
    if (error) {
      console.error('Google login error:', error.message);
      return;
    }
    if (data?.url) {
      const width = 480;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      const popup = window.open(
        data.url,
        'oauth-google',
        `width=${width},height=${height},left=${left},top=${top},resizable=no,toolbar=no,menubar=no`
      );

      // 监听 auth 状态变化，成功后关闭 popup
      const { data: listener } = supabaseClient.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          popup?.close();
          listener.subscription.unsubscribe();
          onRequestClose();
        }
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="fixed inset-0 bg-black/80 z-50"
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      contentLabel="Login Modal"
    >
      <div className="bg-[#1f1f25] rounded-xl shadow-2xl w-full max-w-md relative px-8 py-10 text-center text-white">
        <button
          onClick={onRequestClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold mb-2">Sign in to VEO AI</h2>
        <p className="text-gray-400 mb-8 text-sm">Log in quickly using your Google account.</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-transparent bg-white/10 hover:bg-white/20 rounded-lg py-3 transition-colors"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="font-medium">Continue with Google</span>
        </button>

        <p className="mt-10 text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="/terms-of-service" className="text-[#8A7CFF] hover:underline">
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy-policy" className="text-[#8A7CFF] hover:underline">
            Privacy Policy
          </a>.
        </p>
      </div>
    </Modal>
  );
};

export default GoogleLoginModal; 