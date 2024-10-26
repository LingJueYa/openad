import axios from "axios";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { SplitImageResult } from "@/types/imageTypes";

/**
 * 将图像分割为四个部分
 * @param imageUrl 原始图像的 URL
 * @returns 分割后的图像结果数组
 */
export async function splitImage(
  imageUrl: string
): Promise<SplitImageResult[]> {
  // 下载图片
  const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(data, "binary");

  // 使用 sharp 加载图片
  const image = sharp(buffer);
  const { width, height, format } = await image.metadata();

  if (!width || !height) {
    throw new Error("无法获取图片尺寸");
  }

  // 计算每个小图的尺寸
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);

  // 定义四个区域
  const regions = [
    { left: 0, top: 0, width: halfWidth, height: halfHeight, position: "左上" },
    {
      left: halfWidth,
      top: 0,
      width: halfWidth,
      height: halfHeight,
      position: "右上",
    },
    {
      left: 0,
      top: halfHeight,
      width: halfWidth,
      height: halfHeight,
      position: "左下",
    },
    {
      left: halfWidth,
      top: halfHeight,
      width: halfWidth,
      height: halfHeight,
      position: "右下",
    },
  ];

  // 分割图片
  return Promise.all(
    regions.map(async (region) => {
      const buffer = await image.extract(region).toBuffer();
      return {
        id: uuidv4(),
        data: `data:image/${format};base64,${buffer.toString("base64")}`,
        position: region.position,
      };
    })
  );
}
