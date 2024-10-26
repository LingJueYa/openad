// MJ 提示词 && MJ 生图
import { NextRequest, NextResponse } from "next/server";
import { triggerImagine, getImageResult } from "@/utils/imageGeneration";
import { splitImage } from "@/utils/imageProcessing";
import { callDifyAPI } from "@/utils/apiCalls";
import { ImageGenerationResult } from "@/types/imageTypes";
import { handleError, logInfo } from "@/utils/logging";

// 定义常量
const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * 处理单个输出对象，生成图像并分割
 * @param output Dify API 的输出对象
 * @param userInputImage 用户输入的图像 URL
 */
async function processOutput(
  output: any,
  userInputImage?: string
): Promise<ImageGenerationResult> {
  try {
    const triggerId = await triggerImagine(
      output.prompt_image,
      output.appearance === 1 ? userInputImage : undefined
    );
    const imageUrl = await getImageResult(triggerId);
    const splitImages = await splitImage(imageUrl);
    return {
      triggerId,
      originalImageUrl: imageUrl,
      splitImages,
      promptVideo: output.prompt_video,
    };
  } catch (error) {
    handleError("图像生成失败", error);
    return {
      triggerId: "error",
      originalImageUrl: "",
      splitImages: [],
      promptVideo: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 处理 POST 请求
 * @param req NextRequest 对象
 */
export async function POST(req: NextRequest) {
  const jsonData = await req.json();

  if (!jsonData?.inputs?.user_input_image) {
    return NextResponse.json({ message: "缺少必要的参数" }, { status: 400 });
  }

  try {
    logInfo("发送给 Dify API 的数据", jsonData);
    logInfo("Dify API URL", `${DIFY_API_URL}/workflows/run`);
    logInfo("Dify API Key", DIFY_API_KEY ? "已设置" : "未设置");

    // 调用 Dify API
    const { data } = await callDifyAPI(DIFY_API_URL, DIFY_API_KEY, jsonData);

    const outputsData = data.data.outputs;
    logInfo("输出内容", outputsData);

    if (!outputsData?.outputs?.length) {
      throw new Error("无效的输出数据结构");
    }

    // 处理每个输出对象
    const results: ImageGenerationResult[] = await Promise.all(
      outputsData.outputs.map((output: any) =>
        processOutput(output, jsonData.inputs.user_input_image)
      )
    );

    logInfo("获取到的图片结果", results);

    return NextResponse.json(results);
  } catch (error: unknown) {
    return handleError("运行工作流错误", error, true);
  }
}
