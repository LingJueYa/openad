import { NextRequest, NextResponse } from "next/server";
import { handleError, logInfo } from "@/utils/logging";
import jwt from 'jsonwebtoken';
import { enqueueTask, setTaskStatus } from '@/utils/queue';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const ACCESS_KEY = process.env.KE_LING_ACCESS_KEY!;
const SECRET_KEY = process.env.KE_LING_SECRET_KEY!;
const API_BASE_URL = process.env.KE_LING_API_BASE_URL!;

interface TaskResult {
  taskId: string;
  status: string;
  videoUrl?: string;
}

function generateJWT(accessKey: string, secretKey: string): string {
  return jwt.sign({ accessKey }, secretKey, { expiresIn: '1h' });
}

async function createImageToVideoTask(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const token = generateJWT(ACCESS_KEY, SECRET_KEY);
  const response = await fetch(`${API_BASE_URL}/create_image_to_video_task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: imageUrl, prompt }),
  });

  if (!response.ok) {
    throw new Error(`创建任务失败: ${response.statusText}`);
  }

  const data = await response.json();
  return data.taskId;
}

async function getTaskStatus(taskId: string): Promise<TaskResult> {
  const token = generateJWT(ACCESS_KEY, SECRET_KEY);
  const response = await fetch(`${API_BASE_URL}/get_image_to_video_task/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`获取任务状态失败: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    taskId: data.taskId,
    status: data.status,
    videoUrl: data.videoUrl,
  };
}

async function waitForTaskCompletion(
  taskId: string,
  maxAttempts = 60
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getTaskStatus(taskId);
    if (result.status === "completed" && result.videoUrl) {
      return result.videoUrl;
    }
    if (result.status === "failed") {
      throw new Error(`任务失败: ${taskId}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 等待 5 秒
  }
  throw new Error(`任务超时: ${taskId}`);
}

async function processTasksInParallel(
  tasks: { imageUrl: string; prompt: string }[]
): Promise<string[]> {
  const taskIds = await Promise.all(
    tasks.map((task) => createImageToVideoTask(task.imageUrl, task.prompt))
  );
  const videoUrls = await Promise.all(taskIds.map(waitForTaskCompletion));
  return videoUrls;
}

async function concatenateVideos(videoUrls: string[]): Promise<string> {
  const outputPath = path.join('/tmp', `output_${Date.now()}.mp4`);
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    
    videoUrls.forEach(url => {
      command = command.input(url);
    });
    
    command
      .on('end', () => resolve(outputPath))
      .on('error', (err: Error) => reject(err))
      .mergeToFile(outputPath, '/tmp');
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    logInfo("接收到的数据", data);

    const tasks = data.map((item: any) => ({
      imageUrl: item.selectedImage.data,
      prompt: item.promptVideo
    }));

    const taskId = await enqueueTask({
      type: 'video_generation',
      data: { tasks }
    });

    await setTaskStatus(taskId, 'queued');

    return NextResponse.json({ taskId });
  } catch (error: unknown) {
    return handleError("处理视频生成请求失败", error, true);
  }
}
