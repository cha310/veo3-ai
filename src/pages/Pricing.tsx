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
      id: 'lite',
      name: 'Lite',
      monthlyPrice: 29.9,
      yearlyPrice: 286,
      background: 'bg-[#1a242f]/90',
      credits: 600,
      features: [
        '600 credits per month',
        'Standard processing speed',
        'Max 5 second videos',
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 49.9,
      yearlyPrice: 479,
      background: 'bg-[#121a22]/90',
      recommended: true,
      credits: 1200,
      features: [
        '1200 credits per month',
        'Fastest processing',
        'Max 8 second videos',
        'Commercial usage rights',
        'Priority support',
      ]
    },
    {
      id: 'pro+',
      name: 'Pro+',
      monthlyPrice: 99.9,
      yearlyPrice: 959,
      background: 'bg-[#28353d]/90',
      credits: 2500,
      features: [
        '2500 credits per month',
        'Fastest processing',
        'Max 8 second videos',
        'Commercial usage rights',
        'Priority support',
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
    <div className="min-h-screen relative bg-gradient-to-b from-[#1b1e26] via-[#12151c] to-[#0b0d12] overflow-hidden">
      {/* 背景柔光圆 */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-[#6C5CE7]/20 blur-3xl rounded-full"></div>
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Plans & Pricing</h1>
        <p className="text-center text-white opacity-80 mb-4 max-w-2xl mx-auto">
          Purchase credit packages to generate high-quality AI videos. Different AI models require different amounts of credits.
        </p>
        <div className="flex justify-center mb-10">
          <p className="text-center text-yellow-300 bg-[#2C3640]/80 py-2 px-4 rounded-md inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 mb-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Payment system coming soon.
          </p>
        </div>
        
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
              {isYearly && <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">Save 20%</span>}
            </button>
          </div>
        </div>
        
        {/* Price cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {creditPacks.map((pack) => (
            <div 
              key={pack.id}
              className={`bg-[#1f1f25]/90 rounded-2xl p-8 text-white shadow-xl relative flex flex-col h-full transition-transform hover:-translate-y-2 hover:shadow-purple-800/40 hover:shadow-2xl ring-1 ring-[#2C3640] ${pack.recommended ? 'ring-2 ring-[#8A7CFF] z-10 hover:scale-105' : ''}`}
            >
              {pack.recommended && (
                <div className="absolute top-3 right-3">
                  <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-2 text-center">{pack.name}</h2>
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

        {/* Credit Packs (One-time purchase) */}
        <section className="mt-24">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Credit Packs</h2>
          <p className="text-center text-white opacity-80 mb-10 max-w-2xl mx-auto">
            Purchase additional credits to generate more videos. Credits never expire and can be used anytime.
          </p>

          {/* Credit packs data */}
          {(() => {
            const oneTimePacks = [
              {
                id: 'starter',
                name: 'Starter Pack',
                credits: 1000,
                price: 49.9,
                background: 'bg-[#0f1722]/90',
              },
              {
                id: 'creator',
                name: 'Creator Pack',
                credits: 2000,
                price: 89.9,
                background: 'bg-[#0f1722]/90',
                popular: true,
              },
              {
                id: 'business',
                name: 'Business Pack',
                credits: 4000,
                price: 159.9,
                background: 'bg-[#0f1722]/90',
              },
            ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {oneTimePacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`bg-[#1f1f25]/90 rounded-2xl p-8 text-white shadow-xl relative flex flex-col h-full transition-transform hover:-translate-y-2 hover:shadow-purple-800/40 hover:shadow-2xl ring-1 ring-[#2C3640] ${pack.popular ? 'ring-2 ring-[#8A7CFF]' : ''}`}
                  >
                    {pack.popular && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Most Popular</span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold mb-1 text-center mt-4">{pack.name}</h3>
                    <p className="text-gray-400 text-center mb-8">{pack.id === 'starter' ? 'Great for occasional use' : pack.id === 'creator' ? 'Ideal for professional creators' : 'Best value for businesses & heavy users'}</p>

                    <div className="text-center mb-6">
                      <span className="text-5xl font-bold tracking-tight mr-1">{pack.credits.toLocaleString()}</span>
                      <span className="text-xl text-gray-300">Credits</span>
                    </div>

                    <div className="text-center mb-8">
                      <span className="text-3xl font-bold">${pack.price}</span>
                    </div>

                    <ul className="text-sm mb-10 space-y-2 px-2 flex flex-col items-start">
                      <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-4 w-4"/> Never expires</li>
                    </ul>

                    <button
                      className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      </main>
    </div>
  );
};

export default Pricing; 