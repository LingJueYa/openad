import axios from "axios";

/**
 * 调用 Dify API
 * @param apiUrl Dify API 的 URL
 * @param apiKey Dify API 的密钥
 * @param data 请求数据
 * @returns API 响应
 */
export async function callDifyAPI(
  apiUrl: string,
  apiKey: string | undefined,
  data: any
) {
  return axios.post(`${apiUrl}/workflows/run`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
