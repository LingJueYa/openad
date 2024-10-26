// 视频生成栏组件
"use client";
import { useState, useEffect, useRef } from "react";
// 导入第三方库
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  Controller,
  Control,
} from "react-hook-form";
import Image from "next/image";
import { IKUpload } from "imagekitio-next";
import { VideoCreateValues } from "@/types/videoTypes";

// [类型安全] VideoCreateValues
interface VideoCreatorProps {
  register: UseFormRegister<VideoCreateValues>;
  errors: FieldErrors<VideoCreateValues>;
  setValue: UseFormSetValue<VideoCreateValues>;
  control: Control<VideoCreateValues>;
}

const VideoCreator: React.FC<VideoCreatorProps> = ({
  register,
  errors,
  setValue,
  control,
}) => {
  // 默认选择的视频比例
  const [selectedRatio, setSelectedRatio] = useState("3:4");
  // 上传后立即预览图片
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 是否上传完毕
  const [isUploading, setIsUploading] = useState(false);
  // 视频比例
  const videoSize = ["3:4", "4:3", "16:9", "9:16"];
  const ikUploadRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const onSuccess = (res: any) => {
    // console.log("上传成功，图片链接:", res.url);
    setPreviewImage(res.url);
    setValue("productImage", res.url);
    setIsUploading(false);
  };

  const onError = (err: any) => {
    console.log("上传失败:", err);
    setIsUploading(false);
  };

  const handleUploadClick = () => {
    if (ikUploadRef.current) {
      ikUploadRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewImage(localPreviewUrl);
      setIsUploading(true);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="space-y-3">
        <Label
          htmlFor="image"
          className="block text-sm sm:text-base font-medium"
        >
           请上传您的商品图
        </Label>
        <Controller
          name="productImage"
          control={control}
          rules={{ required: "请上传商品图片" }}
          render={({ field }) => (
            <div className="relative flex justify-center items-center w-full h-32 sm:h-48 border-2 bg-[#0F0F0F]/90 rounded-xl p-2 sm:p-4 text-center cursor-pointer hover:border-blue-500 transition duration-300" onClick={handleUploadClick}>
              <IKUpload
                ref={ikUploadRef}
                fileName="product-image.jpg"
                onError={onError}
                onSuccess={onSuccess}
                onChange={(e: any) => {
                  handleFileChange(e);
                  field.onChange(e.target.files[0]);
                }}
                style={{ display: 'none' }}
              />
              {previewImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={previewImage}
                    alt="上传的商品图"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <span className="text-white">正在上传...</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="border border-blue-400 rounded-full mr-4 px-2 text-white/60 text-xl sm:text-2xl">
                    +
                  </span>
                  <span className="text-[#8C8C8C] text-xs sm:text-sm">
                    导入商品图
                  </span>
                </>
              )}
            </div>
          )}
        />
        {errors.productImage && (
          <p className="text-red-500 text-xs mt-1">
            {errors.productImage.message}
          </p>
        )}
      </div>

      <div className="mt-3 sm:mt-12">
        <Label className="block text-sm sm:text-base font-medium mb-4">
          请选择你希望的视频尺寸
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {videoSize.map((ratio) => (
            <Button
              key={ratio}
              type="button"
              variant={selectedRatio === ratio ? "default" : "outline"}
              onClick={() => setSelectedRatio(ratio)}
              className={`py-1 ${selectedRatio === ratio ? "bg-blue-600 text-white" : "bg-[#1B1B1C]/80 text-white/80 border border-gray-500"} rounded-lg transition duration-300`}
            >
              {ratio}
            </Button>
          ))}
        </div>
        <Input type="hidden" value={selectedRatio} {...register("videoSize")} />
      </div>

      <div className="mt-3 sm:mt-14 flex-grow">
        <Label
          htmlFor="adIdea"
          className="block text-sm sm:text-base font-medium mb-4"
        >
          请输入你的其他广告创意
        </Label>
        <Textarea
          id="adIdea"
          {...register("adIdea")}
          placeholder="我想要一个关于香水的广告，要优雅一点，高端一点的，最好画面是金色主题的，看着有钱点。"
          className="w-full h-24 sm:h-48 bg-[#0F0F0F]/90 text-white/90 placeholder:text-white/70 focus:outline-none focus:ring-0 ring-0 rounded-xl p-2 sm:p-3 resize-none text-xs sm:text-sm [--tw-ring-shadow:0_0_#0000]"
        />
        {errors.adIdea && (
          <p className="text-red-500 text-xs mt-1">{errors.adIdea.message}</p>
        )}
      </div>
    </div>
  );
};

export default VideoCreator;
