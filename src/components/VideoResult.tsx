import React from 'react';
import Image from 'next/image';

interface VideoResultProps {
  videoUrl: string;
  onExport: () => void;
  onRegenerate: () => void;
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, onExport, onRegenerate }) => {
  return (
    <div className="w-full bg-[#1D1D1D] px-6 py-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">您的广告视频已生成完成，快去发布广告吧!</h2>
        <button 
          onClick={onExport}
          className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          导出视频
        </button>
      </div>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        <video 
          src={videoUrl} 
          controls
          className="w-full h-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-black bg-opacity-50 rounded-full p-4">
            <Image src="/play-icon.svg" alt="Play" width={24} height={24} />
          </button>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-4">
        对视频不满意，可以重新再次生成哦~
      </p>
      <button 
        onClick={onRegenerate}
        className="mt-2 text-[#4285F4] text-sm hover:underline"
      >
        重新生成
      </button>
    </div>
  );
};

export default VideoResult;

