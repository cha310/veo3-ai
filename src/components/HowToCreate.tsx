import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Edit, Music, Video } from 'lucide-react';

const HowToCreate: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Sign Up or Log In",
      description: "Create an account or log in to access VEOAI.",
      icon: <Monitor className="w-7 h-7" />
    },
    {
      id: 2,
      title: "Enter Your Prompt",
      description: "Type a text description or upload images to describe the video you want.",
      icon: <Edit className="w-7 h-7" />
    },
    {
      id: 3,
      title: "Customize Audio",
      description: "Add instructions for sound effects, dialogue, or ambient noise to enhance your video.",
      icon: <Music className="w-7 h-7" />
    },
    {
      id: 4,
      title: "Generate and Review",
      description: "Let VEOAI create your video, then preview and download your AI-generated clip.",
      icon: <Video className="w-7 h-7" />
    }
  ];

  // 处理Start Your First Video按钮点击事件，确保页面滚动到顶部
  const handleStartVideoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 防止默认行为
    event.preventDefault();
    
    // 导航到create-video页面
    window.location.href = '/create-video';
    
    // 确保页面滚动到顶部
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#121a22]">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent mb-3">
            How to Create AI Videos with Veo 3
          </h2>
          <p className="text-lg text-gray-300 max-w-1xl mx-auto">
            Follow these simple steps to generate videos with synchronized audio using VEOAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] rounded-full flex items-center justify-center mb-3 relative shadow-lg shadow-[#8A7CFF]/20">
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#121a22] rounded-full flex items-center justify-center text-[#8A7CFF] font-bold border-2 border-[#8A7CFF]">
                    {step.id}
                  </div>
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent mb-1 text-center">
                {step.title}
              </h3>
              <p className="text-gray-300 text-center text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a 
            href="/create-video" 
            onClick={handleStartVideoClick}
            className="px-8 py-3 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all"
          >
            Start Your First Video
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowToCreate; 