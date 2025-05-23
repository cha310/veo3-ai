import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [iframeHeight, setIframeHeight] = useState(500);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 获取嵌入URL
  const getEmbedUrl = () => {
    if (video.embedUrl) {
      // 添加dark主题参数，确保URL格式正确
      const baseUrl = video.embedUrl.split('?')[0];
      const params = new URLSearchParams(video.embedUrl.split('?')[1] || '');
      params.set('theme', 'dark');
      params.set('dnt', 'true');
      params.set('hideCard', 'false');
      params.set('hideThread', 'false');
      return `${baseUrl}?${params.toString()}`;
    }
    
    // 从videoUrl中提取推文ID
    let tweetId = '';
    
    if (video.videoUrl.includes('twitter.com')) {
      const parts = video.videoUrl.split('/');
      tweetId = parts[parts.length - 1];
    } else if (video.videoUrl.includes('x.com')) {
      const parts = video.videoUrl.split('/');
      tweetId = parts[parts.length - 1];
    }
    
    if (!tweetId) return '';
    
    return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&dnt=true&hideCard=false&hideThread=false`;
  };

  // 监听窗口大小变化，调整iframe高度
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth <= 768) {
        setIframeHeight(550); // 移动设备上更高一些
      } else {
        setIframeHeight(500);
      }
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div className="overflow-hidden mb-10 transition-all duration-300 hover:translate-y-[-5px]">
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        className="w-full rounded-xl"
        style={{ 
          height: `${iframeHeight}px`,
          maxWidth: '100%'
        }}
        frameBorder="0"
        allowFullScreen
        scrolling="no"
        title={`Tweet by ${video.creator}`}
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default VideoCard;