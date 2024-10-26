import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis(process.env.REDIS_URL || '');

export interface QueueTask {
  id: string;
  type: "video_generation" | "video_concatenation";
  data: any;
}

export async function enqueueTask(
  task: Omit<QueueTask, "id">
): Promise<string> {
  const id = uuidv4();
  const fullTask: QueueTask = { ...task, id };
  await redis.lpush("video_tasks", JSON.stringify(fullTask));
  return id;
}

export async function dequeueTask(): Promise<QueueTask | null> {
  const task = await redis.rpop("video_tasks");
  return task ? JSON.parse(task) : null;
}

export async function getTaskStatus(taskId: string): Promise<string | null> {
  return redis.get(`task:${taskId}:status`);
}

export async function setTaskStatus(
  taskId: string,
  status: string
): Promise<void> {
  await redis.set(`task:${taskId}:status`, status);
}
