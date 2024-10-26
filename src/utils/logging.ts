// 日志工具函数
import { NextResponse } from "next/server";

/**
 * 处理错误并可选择返回 NextResponse
 * @param message 错误消息
 * @param error 错误对象
 * @param returnResponse 是否返回 NextResponse
 */
export function handleError(
  message: string,
  error: unknown,
  returnResponse = false
) {
  console.error(message, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (returnResponse) {
    return NextResponse.json(
      { message: "内容输出错误", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 记录信息日志
 * @param message 日志消息
 * @param data 相关数据
 */
export function logInfo(message: string, data?: any) {
  console.log(message, data ? JSON.stringify(data, null, 2) : "");
}
