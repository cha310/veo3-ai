import React, { useRef, useEffect, useState } from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  // 获取嵌入URL，确保正确显示完整推文
  const getEmbedUrl = () => {
    if (video.embedUrl) {
      const baseUrl = video.embedUrl.split('?')[0];
      const params = new URLSearchParams(video.embedUrl.split('?')[1] || '');
      params.set('theme', 'dark');
      params.set('dnt', 'true');
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
    
    // 基础URL，不添加过多可能导致问题的参数
    return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`;
  };

  // 使用简单的onLoad处理程序
  useEffect(() => {
    const handleLoad = () => {
      // 延迟设置加载完成，确保内容有时间渲染
      setTimeout(() => setLoaded(true), 800);
    };

    if (iframeRef.current) {
      iframeRef.current.onload = handleLoad;
    }

    // 保险措施：3秒后无论如何都显示内容
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`twitter-card-wrapper ${loaded ? 'loaded' : 'loading'}`}>
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        className="twitter-card"
        style={{ height: '550px' }}
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        title={`Tweet by ${video.creator}`}
        loading="lazy"
      />
    </div>
  );
};

export default VideoCard;