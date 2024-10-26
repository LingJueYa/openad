// 分镜组件
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// 定义属性接口
interface StoryBoardProps {
  setShowGeneratingModal: (show: boolean) => void;
  setShowGameModal: (show: boolean) => void;
  onVideoGenerated: (url: string) => void; // 添加这一行
}

interface SplitImageResult {
  id: string;
  data: string;
  position: string;
}

interface ImageGenerationResult {
  triggerId: string;
  originalImageUrl: string;
  splitImages: SplitImageResult[];
  promptVideo: string;
}

interface StoryBoardData {
  sections: ImageGenerationResult[];
}

const defaultData: StoryBoardData = {
  sections: Array(4)
    .fill(null)
    .map((_, index) => ({
      triggerId: `default-${index}`,
      originalImageUrl: "",
      splitImages: Array(4)
        .fill(null)
        .map((_, frameIndex) => ({
          id: `default-${index}-${frameIndex}`,
          data: "",
          position: ["左上", "右上", "左下", "右下"][frameIndex],
        })),
      promptVideo: "",
    })),
};

const StoryBoard: React.FC<StoryBoardProps> = ({
  setShowGeneratingModal,
  setShowGameModal,
  onVideoGenerated,
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<StoryBoardData>(defaultData);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchStoryboardData();
  }, []);

  useEffect(() => {
    setSelectedFrames(
      data.sections.map((section) => section.splitImages[0].id)
    );
  }, [data]);

  const fetchStoryboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mj-prompt");
      const responseData = await response.json();
      if (responseData && responseData.length > 0) {
        setData({ sections: responseData });
      }
    } catch (error) {
      console.error("Failed to fetch storyboard data:", error);
      toast({
        title: "错误",
        description: "获取图片数据失败",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrameClick = (sectionIndex: number, frameId: string) => {
    setSelectedFrames((prev) => {
      const newSelected = [...prev];
      newSelected[sectionIndex] = frameId;
      return newSelected;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setShowGeneratingModal(true);

    const exportData = data.sections.map((section, index) => ({
      triggerId: section.triggerId,
      selectedImageId: selectedFrames[index],
      selectedImage: section.splitImages.find(
        (img) => img.id === selectedFrames[index]
      ),
      promptVideo: section.promptVideo,
    }));

    try {
      const response = await fetch("/api/keeling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error("Keeling API request failed");
      }

      const result = await response.json();
      setTaskId(result.taskId);
      checkTaskStatus(result.taskId);
    } catch (error) {
      console.error("Error calling Keeling API:", error);
      toast({
        title: "错误",
        description: "视频生成失败，请重试",
        variant: "destructive",
      });
      setIsExporting(false);
      setShowGeneratingModal(false);
    }
  };

  const checkTaskStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/task-status?taskId=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch task status");
      }
      const { status } = await response.json();

      if (status === "completed") {
        toast({
          title: "成功",
          description: "视频生成成功！",
          variant: "default",
        });
        setIsExporting(false);
        setShowGeneratingModal(false);
      } else if (status === "failed") {
        toast({
          title: "错误",
          description: "视频生成失败，请重试",
          variant: "destructive",
        });
        setIsExporting(false);
        setShowGeneratingModal(false);
      } else {
        // 如果任务仍在进行中，继续检查
        setTimeout(() => checkTaskStatus(id), 5000);
      }
    } catch (error) {
      console.error("Error checking task status:", error);
      toast({
        title: "错误",
        description: "检查任务状态失败",
        variant: "destructive",
      });
      setIsExporting(false);
      setShowGeneratingModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">加载中...</div>
    );
  }

  return (
    <div className="w-full bg-[#1D1D1D] px-6 py-3 rounded-3xl">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className="bg-blue-400 text-white rounded-xl"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? "生成中..." : "生成视频"}
        </Button>
      </div>

      <div className="space-y-6">
        {data.sections.map((section, sectionIndex) => (
          <div key={section.triggerId} className="space-y-2">
            <h3 className="text-white text-lg font-semibold">
              分镜 {sectionIndex + 1}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {section.splitImages.map((frame, frameIndex) => (
                <div
                  key={frame.id}
                  className={`w-full h-32 rounded-lg relative overflow-hidden cursor-pointer
                    ${
                      selectedFrames[sectionIndex] === frame.id
                        ? "border-2 border-blue-500"
                        : "border-gray-500"
                    } bg-[#3A3A3A]`}
                  onClick={() => handleFrameClick(sectionIndex, frame.id)}
                >
                  {frame.data ? (
                    <Image
                      src={frame.data}
                      alt={`Frame ${frame.position}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      {frame.position}
                    </div>
                  )}
                  {frameIndex === 0 &&
                    selectedFrames[sectionIndex] === frame.id && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl-xl overflow-hidden">
                        默认
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(StoryBoard), { ssr: false });
