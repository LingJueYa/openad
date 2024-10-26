// 主页页面

"use client";

import React, { useState, useCallback, useEffect } from "react";
// 导入组件和钩子
import VideoCreator from "@/components/VideoCreator";
import StoryBoard from "@/components/StoryBoard";
import GeneratingModal from "@/components/GeneratingModal";
import GameModal from "@/components/GameModal";
import { useVideoCreateStore } from "@/store/videoCreateStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoCreateSchema } from "@/schemas/videoCreateSchema";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// 导入类型
import { VideoCreateValues } from "@/types/videoTypes";
import { ImageKitProvider } from "imagekitio-next";
import VideoResult from "@/components/VideoResult";

// 环境变量
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

// ImageKit认证函数
const authenticator = async () => {
  try {
    const response = await fetch("/api/auth");
    if (!response.ok) {
      throw new Error(`认证请求失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("认证失败:", error);
    throw error;
  }
};

const Page: React.FC = () => {
  const { toast } = useToast();
  const { isSubmitting, setIsSubmitting } = useVideoCreateStore();
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<VideoCreateValues>({
    resolver: zodResolver(videoCreateSchema),
  });

  // API调用mutation
  const mutation = useMutation({
    mutationFn: async (data: VideoCreateValues) => {
      const jsonData = {
        inputs: {
          user_input_text: data.adIdea,
          video_size: data.videoSize,
          user_input_image: data.productImage,
        },
        response_mode: "blocking",
        user: "test-user",
      };

      console.log("发送到 API 的数据:", JSON.stringify(jsonData, null, 2));

      const response = await fetch("/api/mj-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setShowGeneratingModal(false);
      setIsSubmitting(false);
      console.log("API 响应:", data);
      reset();
      toast({
        title: "创建成功",
        description: "图片已成功生成",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      setShowGeneratingModal(false);
      toast({
        title: "创建失败",
        description: `图片创建过程中出现错误: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // 表单提交处理
  const onSubmit = useCallback(
    (data: VideoCreateValues) => {
      setIsSubmitting(true);
      setShowGeneratingModal(true);
      mutation.mutate(data);
    },
    [mutation, setIsSubmitting]
  );

  // 游戏模态框打开处理
  const handleOpenGameModal = useCallback(() => {
    setShowGameModal(true);
  }, []);

  // 游戏模态框关闭处理
  const handleCloseGameModal = useCallback(() => {
    setShowGameModal(false);
  }, []);

  const handleVideoGenerated = (url: string) => {
    setVideoUrl(url);
    setVideoGenerated(true);
  };

  const handleRegenerate = () => {
    setVideoGenerated(false);
    // 可能需要重置其他状态
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-gray-900 to-black text-white/90 p-6">
        {/* 左侧表单区域 */}
        <div className="w-1/3 bg-white/10 backdrop-blur-lg rounded-3xl pt-6 pb-10 px-8 shadow-xl flex flex-col">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col h-full"
          >
            <div className="flex-grow h-fit overflow-y-auto">
              <VideoCreator
                register={register}
                errors={errors}
                setValue={setValue}
                control={control}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#2071fc] to-[#e7dbe4] hover:bg-blue-700 text-black font-semibold py-3 rounded-xl transition duration-300 mt-auto"
              onClick={() => {
                if (!isSubmitting) {
                  setShowGeneratingModal(true);
                }
              }}
            >
              {isSubmitting ? "创建中..." : "立即生成"}
            </Button>
          </form>
        </div>
        {/* 右侧区域 */}
        <div className="w-2/3 ml-8 relative">
          {videoGenerated ? (
            <VideoResult
              videoUrl={videoUrl}
              onExport={() => {
                /* 处理导出逻辑 */
              }}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <div
              className="overflow-y-auto h-full pr-4"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black calc(100% - 60px), transparent 100%)",
              }}
            >
              <StoryBoard
                setShowGeneratingModal={setShowGeneratingModal}
                setShowGameModal={setShowGameModal}
                onVideoGenerated={handleVideoGenerated}
              />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#1D1D1D] to-transparent pointer-events-none"></div>
        </div>

        {/* 生成中弹窗 */}
        <GeneratingModal
          isOpen={showGeneratingModal}
          onPlayGame={handleOpenGameModal}
        />

        {/* 游戏弹窗 */}
        <GameModal isOpen={showGameModal} onClose={handleCloseGameModal} />
      </div>
    </ImageKitProvider>
  );
};

export default Page;
