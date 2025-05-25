import React, { useState, useEffect } from 'react';
import { videos } from '../data/videos';
import VideoCard from './VideoCard';
import { VideoCategory } from '../types';

const VideoGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('all');
  const [visibleCount, setVisibleCount] = useState(8); // 初始只加载4个视频，减轻加载压力
  const [filteredVideos, setFilteredVideos] = useState(videos);
  const videosPerPage = 4; // 每次加载更多的视频数量

  const categories: { id: VideoCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'animation', label: 'Animation' },
    { id: 'product', label: 'Product' },
    { id: 'movie', label: 'Movie' },
    { id: 'talk show', label: 'Talk Show' },
    { id: 'other', label: 'Other' },
  ];

  // 当分类变化时更新筛选结果
  useEffect(() => {
    const newFilteredVideos = activeCategory === 'all' 
      ? videos 
      : videos.filter(video => video.category === activeCategory);
    
    setFilteredVideos(newFilteredVideos);
  }, [activeCategory]);
  
  // 提取当前可见的视频
  const visibleVideos = filteredVideos.slice(0, visibleCount);
  
  // 加载更多视频
  const loadMoreVideos = () => {
    setVisibleCount(prevCount => prevCount + videosPerPage);
  };

  // 当切换分类时，重置显示数量
  const handleCategoryChange = (category: VideoCategory) => {
    setActiveCategory(category);
    setVisibleCount(videosPerPage);
    // 平滑滚动到分类部分
    document.getElementById('category-buttons')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="videos" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#121a22]">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
            Explore Videos Created with Veo3
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experience the future of video creation—watch stunning AI-generated clips with perfectly synced audio, highlighting Veo 3's cutting-edge technology in action.
          </p>
        </div>

        <div id="category-buttons" className="flex flex-wrap justify-center mb-12 gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white shadow-md shadow-[#8A7CFF]/20'
                  : 'bg-[#2C3640]/70 text-gray-300 hover:bg-[#3A444E] hover:translate-y-[-2px]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* 瀑布流布局 */}
        <div className="masonry-grid">
          {visibleVideos.map((video, index) => (
            <div key={video.id} className="masonry-item">
              <VideoCard video={video} />
            </div>
          ))}
        </div>

        {visibleVideos.length > 0 && visibleCount < filteredVideos.length && (
          <div className="text-center mt-16">
            <button 
              onClick={loadMoreVideos}
              className="px-8 py-3.5 bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#8A7CFF]/20 hover:translate-y-[-2px]"
            >
              More Videos
            </button>
          </div>
        )}
        
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">There are no videos in this category</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoGallery;