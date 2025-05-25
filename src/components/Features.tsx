import React from 'react';

const Features: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#121a22]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] bg-clip-text text-transparent mb-5">
            Key Features of Veo 3
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore the cutting-edge capabilities that make Veo 3 the most advanced AI video generation model available today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Feature Card 1 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Native Audio Generation</h3>
            <p className="text-gray-300">Create and integrate audio into the videos it produces, providing a complete audiovisual experience.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Advanced Prompt Understanding</h3>
            <p className="text-gray-300">Interpret complex prompts with high accuracy, translating your creative vision into stunning visuals.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Reference to Video</h3>
            <p className="text-gray-300">Create character consistent videos based on references, maintaining visual coherence throughout.</p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Accurate Style Control</h3>
            <p className="text-gray-300">Control the artistic style based on reference images, allowing for precise aesthetic direction.</p>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Camera Controls</h3>
            <p className="text-gray-300">Create videos with specific camera movements, adding cinematic quality to your generated content.</p>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">First and Last Frames</h3>
            <p className="text-gray-300">Generate seamless videos between two uploaded images, creating fluid transitions between fixed points.</p>
          </div>

          {/* Feature Card 7 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Add and Remove Objects</h3>
            <p className="text-gray-300">Add or erase objects within a video scene, giving you complete control over your visual composition.</p>
          </div>

          {/* Feature Card 8 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Flexible Motion Control</h3>
            <p className="text-gray-300">Customize the movements of video objects, creating precisely the action and dynamics you envision.</p>
          </div>

          {/* Feature Card 9 */}
          <div className="bg-[#2A3541] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="text-xl font-semibold text-white mb-4">Integration with Flow</h3>
            <p className="text-gray-300">Create videos with Google's new AI filmmaking tool, expanding your creative possibilities.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 