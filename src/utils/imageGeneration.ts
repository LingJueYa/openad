import fetch from "node-fetch";
import { sleep } from "./common";

const IMAGINE_API_URL = "http://wave.learn2pro.tech/v1/api/trigger/imagine";
const RESULT_API_URL =
  "http://wave.learn2pro.tech/v1/api/trigger/midjourney/result";

/**
 * 触发图像生成
 * @param prompt 图像生成提示
 * @param picurl 可选的图片 URL
 * @returns 触发 ID
 */
export async function triggerImagine(
  prompt: string,
  picurl?: string
): Promise<string> {
  const body = picurl ? { prompt, picurl } : { prompt };
  const response = await fetch(IMAGINE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Imagine API 错误: ${response.status}`);
  }

  const data = await response.json();
  if (data.code === 15 && data.message.includes("Task queue is full")) {
    throw new Error("使用的人太多，请稍后再试");
  }
  if (!data.trigger_id) {
    throw new Error(`无效的 trigger_id: ${JSON.stringify(data)}`);
  }
  return data.trigger_id;
}

/**
 * 获取图像生成结果
 * @param triggerId 触发 ID
 * @param maxRetries 最大重试次数
 * @returns 生成的图像 URL
 */
export async function getImageResult(
  triggerId: string,
  maxRetries = 30
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(`${RESULT_API_URL}/${triggerId}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Result API 错误: ${response.status}`);
    }

    const result = await response.json();

    if (result.code === 0 && result.message === "end") {
      return result.data; // 返回图片 URL
    }

    if (result.code === 0 && result.message === "generating") {
      console.log(`图片正在生成中，5秒后重试。重试次数: ${i + 1}`);
    } else if (
      result.code === -2 &&
      result.message === "no trigger task, please retry the prompt!"
    ) {
      console.log(`任务尚未开始，5秒后重试。重试次数: ${i + 1}`);
    } else {
      throw new Error(`未知的 API 响应: ${JSON.stringify(result)}`);
    }

    await sleep(5000);
  }

  throw new Error(`获取图片失败，已重试 ${maxRetries} 次`);
}
