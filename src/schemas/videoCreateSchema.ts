import { z } from "zod";

export const videoCreateSchema = z.object({
  productImage: z.any().optional(),
  videoSize: z.enum(["3:4", "4:3", "16:9", "9:16"], {
    required_error: "请选择视频尺寸",
  }),
  adIdea: z.string().min(1, "请输入广告创意文案"),
});

export type VideoCreateValues = z.infer<typeof videoCreateSchema>;
