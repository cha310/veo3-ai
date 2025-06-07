import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CanonicalHeadProps {
  baseUrl?: string;
}

const CanonicalHead: React.FC<CanonicalHeadProps> = ({ baseUrl = 'https://www.veo3-ai.net' }) => {
  const location = useLocation();

  useEffect(() => {
    // 删除任何现有的canonical标签
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // 创建新的canonical标签
    const canonicalUrl = `${baseUrl}${location.pathname}`;
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    document.head.appendChild(link);

    // 清理函数 - 组件卸载时移除canonical标签
    return () => {
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag) {
        canonicalTag.remove();
      }
    };
  }, [location.pathname, baseUrl]);

  // 这个组件不渲染任何内容
  return null;
};

export default CanonicalHead; 