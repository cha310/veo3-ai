import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle } from 'lucide-react';
import { addCredits, getUserCredits } from '../services/creditService';

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userData);
        setUserCredits(user.credits || 0);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Credit packages configuration
  const creditPacks = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 200,
      monthlyPrice: 12,
      yearlyPrice: 6,
      background: 'bg-[#1a242f]/90',
      features: [
        'Generate Kling 1.6 videos (20 credits each)',
        'Up to 10 videos per month',
        'Email support',
        'Basic video effects'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 1000,
      monthlyPrice: 49,
      yearlyPrice: 25,
      background: 'bg-[#121a22]/90',
      recommended: true,
      features: [
        'Generate Kling 1.6 videos (20 credits each)',
        'Generate Veo 2 videos (180 credits each)',
        'Up to 50 videos',
        'Priority support',
        'Advanced video effects'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      credits: 2000,
      monthlyPrice: 89,
      yearlyPrice: 45,
      background: 'bg-[#28353d]/90',
      features: [
        'Generate Kling 1.6 videos (20 credits each)',
        'Generate Veo 2 videos (180 credits each)',
        'Generate Veo 3 videos (330 credits each)',
        'Unlimited video generation',
        '24/7 customer support',
        'All premium features'
      ]
    }
  ];

  // Handle purchase
  const handlePurchase = (packId: string) => {
    if (!isLoggedIn) {
      setPurchaseStatus({
        success: false,
        message: "Please login before purchasing credits"
      });
      return;
    }

    // Get current package
    const selectedPack = creditPacks.find(pack => pack.id === packId);
    if (!selectedPack) return;
    
    // Simulate successful payment
    const success = addCredits(selectedPack.credits);
    
    if (success) {
      // Update local credit display
      setUserCredits(getUserCredits());
      
      setPurchaseStatus({
        success: true,
        message: `Successfully purchased ${selectedPack.credits} credits!`
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setPurchaseStatus({});
      }, 3000);
    } else {
      setPurchaseStatus({
        success: false,
        message: "Purchase failed, please try again later"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c94b31] via-[#2a3e4a] to-[#41968a]">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Plans & Pricing</h1>
        <p className="text-center text-white opacity-80 mb-4 max-w-2xl mx-auto">
          Purchase credit packages to generate high-quality AI videos. Different AI models require different amounts of credits.
        </p>
        <p className="text-center text-yellow-300 mb-10 max-w-2xl mx-auto bg-[#2C3640]/80 py-2 px-4 rounded-md inline-block">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Payment system coming soon. Currently in development.
        </p>
        
        {/* Display current credits */}
        {isLoggedIn && (
          <div className="text-center mb-8">
            <div className="inline-block bg-[#2C3640] px-5 py-3 rounded-full text-white shadow-md">
              Current Credits: <span className="text-[#8A7CFF] font-semibold text-xl">{userCredits}</span>
            </div>
          </div>
        )}
        
        {/* Display purchase status message */}
        {purchaseStatus.message && (
          <div className={`text-center mb-8 ${purchaseStatus.success ? 'text-green-400' : 'text-red-400'}`}>
            <div className="inline-block bg-[#2C3640] px-5 py-3 rounded-full shadow-md">
              {purchaseStatus.message}
            </div>
          </div>
        )}
        
        {/* Toggle buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#2c2c3d]/50 rounded-full p-1 flex items-center">
            <button
              onClick={() => setIsYearly(false)}
              className={`py-2 px-6 rounded-full transition-all ${!isYearly ? 'bg-white text-[#2c2c3d]' : 'text-gray-300'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`py-2 px-6 rounded-full transition-all flex items-center gap-2 ${isYearly ? 'bg-white text-[#2c2c3d]' : 'text-gray-300'}`}
            >
              <span>Yearly</span>
              {isYearly && <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">Save 50%</span>}
            </button>
          </div>
        </div>
        
        {/* Price cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {creditPacks.map((pack) => (
            <div 
              key={pack.id}
              className={`${pack.background} rounded-2xl p-8 text-white shadow-xl relative flex flex-col h-full ${pack.recommended ? 'transform hover:scale-105 transition-all z-10 border border-[#8A7CFF]/30' : ''}`}
            >
              {pack.recommended && (
                <div className="absolute top-3 right-3">
                  <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-2 text-center">{pack.name}</h2>
              <div className="text-center text-[#8A7CFF] font-bold mb-4">
                {pack.credits} Credits
              </div>
              <div className="flex items-end justify-center mb-8">
                <span className="text-4xl font-bold">${isYearly ? pack.yearlyPrice : pack.monthlyPrice}</span>
                {isYearly && (
                  <span className="line-through text-gray-500 text-sm ml-2">${pack.monthlyPrice}</span>
                )}
                <span className="text-gray-400 ml-1 mb-1">USD /{isYearly ? 'year' : 'mo'}</span>
              </div>
              
              <button 
                // onClick={() => handlePurchase(pack.id)} - 暂时禁用购买功能
                className={`w-full py-3 px-4 rounded-lg ${pack.recommended ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] hover:shadow-lg hover:shadow-[#8A7CFF]/20' : 'border border-gray-600 hover:bg-white/10'} text-white font-medium transition-colors mb-8 opacity-50 cursor-not-allowed`}
                disabled={true}
              >
                Coming Soon
              </button>
              
              <div className="space-y-4 flex-grow">
                {pack.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3 h-5 w-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Model credit consumption explanation */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-6">Video Generation Credit Consumption</h3>
          <div className="bg-[#1a242f]/60 rounded-xl p-6 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#2C3640] p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                    <span className="text-white font-bold">K</span>
                  </div>
                  <h4 className="text-lg font-semibold">Kling 1.6</h4>
                </div>
                <p className="text-center text-3xl font-bold text-[#8A7CFF]">20</p>
                <p className="text-center text-sm text-gray-400">credits/video</p>
              </div>
              
              <div className="bg-[#2C3640] p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                    <span className="text-white font-bold">G</span>
                  </div>
                  <h4 className="text-lg font-semibold">Veo 2</h4>
                </div>
                <p className="text-center text-3xl font-bold text-[#8A7CFF]">180</p>
                <p className="text-center text-sm text-gray-400">credits/video</p>
              </div>
              
              <div className="bg-[#2C3640] p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                    <span className="text-white font-bold">G</span>
                  </div>
                  <h4 className="text-lg font-semibold">Veo 3</h4>
                </div>
                <p className="text-center text-3xl font-bold text-[#8A7CFF]">330</p>
                <p className="text-center text-sm text-gray-400">credits/video</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing; 