import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  getUserCredits, 
  consumeCredits, 
  getModelCreditCost, 
  hasEnoughCredits 
} from '../services/creditService';
import { Link } from 'react-router-dom';

// 安全获取API密钥的函数
const getApiKey = (): string => {
  // 在生产环境中，应该通过后端API获取或使用环境变量
  // 这里使用了一个混淆处理的密钥作为临时解决方案
  
  // 将API密钥分成多个部分并进行简单变换，增加逆向工程的难度
  const part1 = 'pollo_ZE';
  const part2 = atob('WHBuWWtzNA=='); // base64编码

  
  // 动态拼接以减少整个密钥在代码中以明文形式出现的可能性
//   return [part1, part2, part3, part4, part5.split('').reverse().join('')].join('');
return [part1, part2.split('').reverse().join('')].join('');
};

// 模拟后端代理的API调用函数
const callPolloApi = async (endpoint: string, data?: any, method: string = 'POST') => {
  const apiKey = getApiKey();
  
  const options: RequestInit = {
    method,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`https://pollo.ai/api/platform/${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
};

type GenerationState = 'idle' | 'generating' | 'success' | 'error';

// 定义可用的AI模型
type AIModel = {
  id: string;
  name: string;
  apiPath: string;
  description: string;
  logo?: string;
};

const availableModels: AIModel[] = [
  {
    id: 'kling-1.6',
    name: 'Kling 1.6',
    apiPath: 'generation/kling-ai/kling-v1-6',
    description: 'High quality image-to-video generation model',
    logo: '🎬', // 使用emoji作为简单的图标
  },
  {
    id: 'veo-2',
    name: 'Google Veo 2',
    apiPath: 'generation/google/veo2',
    description: 'Google\'s video generation model with smooth dynamic effects',
    logo: '🎥', // 使用emoji作为简单的图标
  },
  {
    id: 'veo-3',
    name: 'Google Veo 3',
    apiPath: 'generation/google/veo3',
    description: 'Google\'s latest video generation model with better quality',
    logo: '🎬', // 使用emoji作为简单的图标
  },
];

// 渲染模型图标的辅助函数
const renderModelIcon = (modelName: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };
  
  if (modelName.includes('Google')) {
    return (
      <img src="/icons/google.svg" alt="Google" className={sizeClasses[size]} />
    );
  } else if (modelName.includes('Kling')) {
    return (
      <img src="/icons/kling.svg" alt="Kling" className={sizeClasses[size]} />
    );
  } else {
    const currentModel = availableModels.find(m => m.name === modelName);
    return <span className="text-xl">{currentModel?.logo || ''}</span>;
  }
};

const TextToVideo: React.FC = () => {
  // 核心状态机
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  
  // 表单输入状态
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generateAudio, setGenerateAudio] = useState(true);
  const [videoDuration, setVideoDuration] = useState<5 | 8>(8);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(availableModels[2]); // 默认选择VEO3模型

  // 用户积分状态
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 结果与进度状态
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ taskId?: string; status?: string; videoUrl?: string } | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [statusCheckCount, setStatusCheckCount] = useState(0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 加载用户积分
  useEffect(() => {
    const checkUserCredits = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserCredits(user.credits || 0);
        } catch (error) {
          console.error('解析用户数据错误:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUserCredits(0);
      }
    };

    checkUserCredits();
    
    // 监听localStorage变化，更新积分显示
    window.addEventListener('storage', checkUserCredits);
    
    return () => {
      window.removeEventListener('storage', checkUserCredits);
    };
  }, []);

  // 获取当前模型所需积分
  const getCurrentModelCreditCost = () => {
    return getModelCreditCost(selectedModel.id);
  };

  useEffect(() => {
    // 设置页面标题，根据选择的模型更新
    document.title = `Create AI Videos with ${selectedModel.name} - Text to Video`;
    
    return () => {
      document.title = 'Veo 3 AI - Try Google Veo 3 AI Video Model Now';
    };
  }, [selectedModel]); // 添加selectedModel作为依赖项

  // 处理点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 转换图片为base64
  const getBase64FromImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Poll task status - Final revision based on Pollo official documentation
  const pollTaskStatus = (taskId: string) => {
    let checkCount = 0;
    const maxChecks = 180;
    const modelApiId = selectedModel.apiPath.split('/').pop(); // Extract the last part of API path as model ID

    const poller = async () => {
      if (checkCount >= maxChecks) {
        setError('Video generation timed out. Please try again later.');
        setGenerationState('error');
        return;
      }
      checkCount++;
      setStatusCheckCount(checkCount);
      
      // Simplify status messages, don't mention specific model names
      if (checkCount === 1) {
        setGenerationProgress(`Generating your video...`);
      } else if (checkCount % 15 === 0) { // Update message every 15 checks
        setGenerationProgress(`Still working on your video...`);
      }
      
      try {
        // According to Pollo documentation, the correct API path is /generation/{taskId}/status
        const response = await callPolloApi(`generation/${taskId}/status`, undefined, 'GET');
        // Keep debug logs but simplify UI messages
        console.log(`%c[Poll #${checkCount}] ${selectedModel.name} task status check:`, 'color: dodgerblue; font-weight: bold;', response);

        // Get response data, compatible with different nested structures
        const responseData = response.data || response;
        // Get status, prioritize from main object, also check generations array
        let status = responseData.status?.toLowerCase();
        let videoUrl = null;
        let errorMsg = null;

        // According to documentation, process generations array
        if (responseData.generations && responseData.generations.length > 0) {
          const generation = responseData.generations[0];
          // If main object has no status, get from first generation
          if (!status) status = generation.status?.toLowerCase();
          // Get URL from generation object
          if (generation.url) videoUrl = generation.url;
          // Get failure message
          if (generation.failMsg) errorMsg = generation.failMsg;
        }

        // Also check possible locations in result object
        if (!videoUrl && responseData.result) {
          const result = responseData.result;
          if (result.url) videoUrl = result.url;
          if (result.videoUrl) videoUrl = result.videoUrl;
        }

        // If still no status (may be old version API), use compatibility mode
        if (!status && responseData.result?.status) {
          status = responseData.result.status.toLowerCase();
        }

        console.log(`%c[${selectedModel.name} status parsing] Status: ${status}, URL: ${videoUrl || 'Not found'}`, 'color: orange');

        // According to Pollo official documentation, handle three main statuses
        if (status === 'succeed' || status === 'completed' || status === 'success') {
          console.log(`%c[${selectedModel.name} success] Video generation completed!`, 'color: green; font-weight: bold;');
          
          if (videoUrl) {
            console.log('%c[Video URL]', 'color: lime; font-weight: bold;', videoUrl);
            setResult(prev => ({ ...prev, status: 'completed', videoUrl }));
            setGenerationState('success');
            setGenerationProgress(`🎉 Your video is ready!`);
          } else {
            console.error(`%c[URL missing] ${selectedModel.name} task succeeded but video URL not found`, 'color: red;', responseData);
            setError(`Unable to retrieve video. Please try again.`);
            setGenerationState('error');
          }
          return; // Stop polling
        }

        if (status === 'waiting' || status === 'processing' || status === 'pending') {
          console.log(`%c[${selectedModel.name} waiting] Video still generating...`, 'color: blue;');
          // Don't update detailed information of each check on UI
          setTimeout(poller, 5000);
          return;
        }

        if (status === 'failed' || status === 'error') {
          console.error(`%c[${selectedModel.name} failed] Video generation failed`, 'color: red; font-weight: bold;');
          const failMessage = errorMsg || responseData.message || responseData.error || 'Unknown error';
          setError(`Video generation failed. Please try again.`);
          setGenerationState('error');
          return; // Stop polling
        }

        // Unknown status, continue polling
        console.log(`%c[${selectedModel.name} unknown status] ${status || 'Status not returned'}`, 'color: purple;');
        // Don't display unknown status messages on UI
        setTimeout(poller, 5000);

      } catch (error) {
        console.error(`[Poll #${checkCount}] ${selectedModel.name} request error:`, error);
        // Don't display network error details on UI
        setTimeout(poller, 5000);
      }
    };

    poller();
  };

  // Call API to generate video
  const generateVideo = async () => {
    if (!prompt && activeTab === 'text') {
      setError('Please enter a prompt');
      return;
    }
    if (!imageFile && activeTab === 'image') {
      setError('Please upload an image');
      return;
    }
    
    // Check if user is logged in
    if (!isLoggedIn) {
      setError('Please login before generating a video');
      return;
    }
    
    // Check if user has enough credits
    if (!hasEnoughCredits(selectedModel.id)) {
      setError(`Not enough credits! Generating a ${selectedModel.name} video requires ${getCurrentModelCreditCost()} credits, you currently have ${userCredits} credits`);
      return;
    }
    
    // Initialize state
    setGenerationState('generating');
    setError('');
    setResult(null);
    setStatusCheckCount(0);
    setGenerationProgress('Generating your video...');

    try {
      const requestData: any = {
        input: {
          prompt,
          negativePrompt: negativePrompt || '',
          length: videoDuration,
          aspectRatio: '16:9',
          seed: Math.floor(Math.random() * 1000),
        }
      };

      if (activeTab === 'image' && imageFile) {
        requestData.input.image = await getBase64FromImage(imageFile);
      }
      
      setGenerationProgress(`Processing your request...`);
      
      // Use the API path of the selected model
      const response = await callPolloApi(selectedModel.apiPath, requestData);

      console.log('Task creation API response:', response);

      // **Key fix**: Adapt to new API structure, taskId is now at response.data.taskId
      const taskId = response && response.data ? response.data.taskId : null;

      if (taskId) {
        // Consume credits
        const consumeSuccess = consumeCredits(selectedModel.id);
        if (!consumeSuccess) {
          setError('Failed to consume credits, please try again later');
          setGenerationState('error');
          return;
        }
        
        // Update credits displayed on interface
        setUserCredits(getUserCredits());
        
        // Store the entire `data` object in result, as it may contain initial status
        setResult(response.data);
        setGenerationProgress(`Task submitted to ${selectedModel.name}, starting to poll status...`);
        pollTaskStatus(taskId); // Start polling
      } else {
        const apiResponse = response ? JSON.stringify(response) : 'No response content';
        setError(`Could not extract task ID from API response. API returned: ${apiResponse}`);
        setGenerationState('error');
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setGenerationState('error');
    }
  };

  // Add a function to directly download video
  const downloadVideo = (url: string) => {
    if (!url) return;
    
    try {
      // Check URL format to ensure it's valid
      const videoUrl = new URL(url);
      
      // Create an XMLHttpRequest to get video content
      const xhr = new XMLHttpRequest();
      xhr.open('GET', videoUrl.href, true);
      xhr.responseType = 'blob';
      
      // Show downloading status
      setGenerationProgress('Downloading video...');
      
      xhr.onload = function() {
        if (this.status === 200) {
          // Create a Blob URL
          const blob = new Blob([this.response], { type: 'video/mp4' });
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a hidden a tag and trigger download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = blobUrl;
          a.download = `ai-video-${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up resources
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            setGenerationProgress('Video downloaded successfully!');
          }, 100);
        } else {
          console.error('Failed to download video:', this.status);
          setGenerationProgress('Download failed. Try again.');
          
          // If XHR download fails, try to open URL directly (browser built-in download)
          window.open(url, '_blank');
        }
      };
      
      xhr.onerror = function() {
        console.error('XHR error when downloading video');
        setGenerationProgress('Download failed. Try again.');
        
        // If XHR error occurs, try to open URL directly (browser built-in download)
        window.open(url, '_blank');
      };
      
      xhr.send();
    } catch (error) {
      console.error('Error in downloadVideo:', error);
      
      // If any error occurs, fall back to basic method
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ai-video-${Date.now()}.mp4`;
      a.target = '_self'; // Force handling in current page
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }
  };

  // Render the right preview area - using state machine
  const renderPreviewArea = () => {
    switch (generationState) {
      case 'generating':
        return (
          <div className="w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-[#2C3640]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#8A7CFF] border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {renderModelIcon(selectedModel.name, 'lg')}
                </div>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Video Generation</h3>
              <p className="text-gray-400 mb-4">
                {generationProgress || 'Generating your video...'}
              </p>
            </div>

            {/* Remove progress indicator */}
            
            {/* Remove task information */}
            
            {/* Simplify prompt information */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>⏰ Estimated time: {videoDuration === 5 ? '3-5' : '5-8'} minutes</p>
              <p>💡 Keep this page open while we generate your video</p>
            </div>
          </div>
        );

      case 'success':
        if (result?.videoUrl) {
          return (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-semibold">Your Video is Ready</h3>
                <span className="text-green-400 text-sm bg-green-500/20 px-2 py-1 rounded">✓ Complete</span>
              </div>
              <video src={result.videoUrl} controls autoPlay loop playsInline className="w-full rounded-lg shadow-lg" />
              <div className="mt-4 flex gap-3 justify-center">
                <button 
                  onClick={() => result.videoUrl && downloadVideo(result.videoUrl)}
                  className="flex items-center gap-2 py-2 px-4 bg-[#8A7CFF] text-white rounded-lg hover:bg-[#7B6FEE] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Video
                </button>
                <button onClick={() => setGenerationState('idle')} className="py-2 px-4 bg-[#2C3640] text-white rounded-lg hover:bg-[#3A444E] transition-colors">Generate New</button>
              </div>
            </div>
          );
        }
        setError('Video URL missing, please try again');
        setGenerationState('error');
        // Fallthrough to error case

      case 'error':
        return (
          <div className="w-full text-center p-4">
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Video Generation Failed</h3>
            <div className="bg-[#2C3640]/50 rounded-lg p-3 mb-6 max-w-md mx-auto">
              <p className="text-red-300 text-sm break-words">{error || 'Something went wrong. Please try again.'}</p>
            </div>
            <button
              onClick={() => {
                setGenerationState('idle');
                setError('');
                setResult(null);
                setStatusCheckCount(0);
              }}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] text-white font-medium hover:shadow-lg hover:shadow-[#8A7CFF]/20 transition-all"
            >
              Try Again
            </button>
          </div>
        );
      
      case 'idle':
      default:
        return (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#2C3640] flex items-center justify-center mx-auto mb-4">
              {renderModelIcon(selectedModel.name, 'lg')}
            </div>
            <h3 className="text-white text-xl mb-2">Ready to Generate Your AI Video</h3>
            <p className="text-gray-400 mb-4">
              Create high quality videos with {selectedModel.name}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#121a22]">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-16 pb-6">
        {/* 顶部标签页导航 */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-700 mt-6">
          <div className="flex text-lg font-medium w-full">
            <button
              className={`px-8 py-4 transition-all relative ${
                activeTab === 'image' ? 'text-white bg-[#1a242f]/0' : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('image')}
            >
              <span className="relative z-10">Image to Video</span>
              {activeTab === 'image' && (
                <>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-500"></div>
                  <div className="absolute bottom-1 left-0 w-full h-1 bg-pink-500/20"></div>
                </>
              )}
            </button>
            <button
              className={`px-8 py-4 transition-all relative ${
                activeTab === 'text' ? 'text-white bg-[#1a242f]/0' : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('text')}
            >
              <span className="relative z-10">Text to Video</span>
              {activeTab === 'text' && (
                <>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-500"></div>
                  <div className="absolute bottom-1 left-0 w-full h-1 bg-pink-500/20"></div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 页面标题和模型选择 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{activeTab === 'text' ? 'Text to Video' : 'Image to Video'}</h1>
          
          {/* 模型选择下拉菜单 */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center gap-2 py-2 px-4 bg-[#2C3640] text-white rounded-lg border border-gray-600 hover:bg-[#3A444E] transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {renderModelIcon(selectedModel.name)}
              <div>
                <div className="text-sm font-medium">{selectedModel.name}</div>
                <div className="text-xs text-[#8A7CFF]">{getCurrentModelCreditCost()} credits</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`absolute right-0 mt-2 w-60 bg-[#2C3640] border border-gray-600 rounded-lg shadow-xl z-10 ${dropdownOpen ? '' : 'hidden'}`}>
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-[#3A444E] transition-colors ${
                    selectedModel.id === model.id ? 'bg-[#3A444E] text-blue-400' : 'text-white'
                  }`}
                >
                  {renderModelIcon(model.name)}
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-400">{model.description}</div>
                    <div className="text-xs text-[#8A7CFF] mt-1">{getModelCreditCost(model.id)} credits</div>
                  </div>
                  {selectedModel.id === model.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧表单 */}
          <div className="w-full lg:w-1/2">
            <div className="bg-[#1a242f] rounded-lg p-6 shadow-lg">
              {/* 图片上传区域 - 仅在Image-to-Video模式显示 */}
              {activeTab === 'image' && (
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Upload Image</label>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-[#8A7CFF] transition-colors"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-60 mx-auto rounded"
                        />
                        <button 
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-[#8A7CFF] text-4xl mb-2">+</div>
                        <p className="text-gray-300">Click or drag image here</p>
                      </>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              )}
              
              {/* 提示词输入 */}
              <div className="mb-6">
                <label htmlFor="prompt" className="block text-gray-300 mb-2">Prompt</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate..."
                  className="w-full p-3 bg-[#2C3640] border border-gray-600 rounded-lg text-white min-h-[100px] resize-none"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">Describe the video content in detail for better results</p>
              </div>
              
              {/* 负面提示词 */}
              <div className="mb-6">
                <label htmlFor="negativePrompt" className="block text-gray-300 mb-2">Negative Prompt (Optional)</label>
                <textarea
                  id="negativePrompt"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Describe elements you want to avoid..."
                  className="w-full p-3 bg-[#2C3640] border border-gray-600 rounded-lg text-white min-h-[80px] resize-none"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">Specify elements you don't want in the video</p>
              </div>
              
              {/* 视频时长选择 */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 flex items-center">
                  Video Duration
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoDuration(5)}
                    className={`py-2 px-4 rounded-lg text-sm transition-all ${
                      videoDuration === 5
                        ? 'bg-[#8A7CFF] text-white font-medium'
                        : 'bg-[#2C3640] text-gray-300 hover:bg-[#3A444E]'
                    }`}
                  >
                    5 seconds
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoDuration(8)}
                    className={`py-2 px-4 rounded-lg text-sm transition-all ${
                      videoDuration === 8
                        ? 'bg-[#8A7CFF] text-white font-medium'
                        : 'bg-[#2C3640] text-gray-300 hover:bg-[#3A444E]'
                    }`}
                  >
                    8 seconds
                  </button>
                </div>
              </div>
              
              {/* 生成音频开关 */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <label htmlFor="generateAudio" className="text-gray-300 text-sm font-medium">Generate Audio</label>
                  <p className="text-xs text-gray-400 mt-1">Add synchronized sound effects and background music</p>
                </div>
                <div
                  className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    generateAudio ? 'bg-[#8A7CFF]' : 'bg-gray-600'
                  }`}
                  onClick={() => setGenerateAudio(!generateAudio)}
                >
                  <span
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      generateAudio ? 'transform translate-x-6' : ''
                    }`}
                  ></span>
                </div>
              </div>
              
              {/* 生成按钮 */}
              <div className="mt-8">
                <button
                  onClick={generateVideo}
                  disabled={generationState === 'generating'}
                  className={`w-full py-4 rounded-lg relative overflow-hidden ${
                    generationState === 'generating'
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#8A7CFF] to-[#6C5CE7] hover:shadow-lg hover:shadow-[#8A7CFF]/20'
                  } text-white font-medium transition-all`}
                >
                  {generationState === 'generating' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Generate Video
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {getCurrentModelCreditCost()} credits
                      </span>
                    </span>
                  )}
                </button>
                
                {/* Login or insufficient credits notice */}
                {!isLoggedIn ? (
                  <div className="mt-2 text-center text-sm text-yellow-500">
                    Please login to generate videos
                  </div>
                ) : userCredits < getCurrentModelCreditCost() ? (
                  <div className="mt-2">
                    <div className="text-center text-sm text-red-500 mb-2">
                      Not enough credits ({userCredits}/{getCurrentModelCreditCost()})
                    </div>
                    <Link 
                      to="/pricing"
                      className="block w-full py-2 px-4 bg-[#2C3640] text-white rounded-lg hover:bg-[#3A444E] transition-colors text-center"
                    >
                      Buy Credits
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* 右侧预览 */}
          <div className="w-full lg:w-1/2">
            <div className="bg-[#1a242f] rounded-lg h-full flex items-center justify-center p-6 shadow-lg min-h-[600px]">
              {renderPreviewArea()}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TextToVideo; 