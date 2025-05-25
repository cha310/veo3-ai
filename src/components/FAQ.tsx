import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  number: number;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, number, isOpen, toggleOpen }) => {
  return (
    <div className="bg-[#2A3541] rounded-xl overflow-hidden mb-4 transition-all duration-300 shadow-md hover:shadow-lg">
      <button 
        className="w-full flex items-start text-left p-6 focus:outline-none"
        onClick={toggleOpen}
      >
        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] rounded-full flex items-center justify-center text-white font-medium mr-4">
          {number}
        </span>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white pr-4">{question}</h3>
            <span className="text-[#8A7CFF]">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </div>
          {isOpen && (
            <div className="mt-4 text-gray-300 pr-8 animate-fadeIn">
              {answer}
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = [
    {
      question: "What is Veo3 AI?",
      answer: "Veo3 ai is Google's advanced generative video and audio model. With veo3 ai, you can create videos with synchronized sound and dialogue from a prompt."
    },
    {
      question: "How is Veo3 AI different from previous versions?",
      answer: "Veo3 ai, also known as veo 3, introduces advanced sound generation, lip-syncing, and fast tracking. Google veo's model integrates with Imagen 4 and Flow for cinematic video creation."
    },
    {
      question: "Who can access Veo3 AI and Google Veo?",
      answer: "Veo3 ai is available to Gemini Ultra subscribers in the US and enterprise users via Vertex AI. Google veo plans wider access soon."
    },
    {
      question: "Can I use Veo3 AI for commercial projects?",
      answer: "Yes, veo3 ai and veo 3 are designed for professional use. Google veo supports everything from marketing videos to feature films."
    },
    {
      question: "How does Veo3 AI handle sound and lip-syncing?",
      answer: "Veo3 ai uses deep learning to generate visuals and audio, ensuring speech matches movement and sounds fit the environment with google veo's innovation."
    },
    {
      question: "What are Imagen 4 and Flow, and how do they work with Veo3 AI?",
      answer: "Imagen 4 is Google's image generation model, while Flow is a new AI-powered movie tool. Both integrate with veo3 ai and veo 3 for seamless video creation."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#121a22]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent mb-5">
            Common Questions About Veo3 AI, Veo 3, and Google Veo
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Want to know how veo3 ai, veo 3, and google veo work? Here are answers to the most frequently asked questions about AI video and audio generation.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem 
              key={index}
              question={item.question}
              answer={item.answer}
              number={index + 1}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 