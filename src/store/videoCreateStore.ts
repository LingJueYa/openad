// [视频创建] 状态
import { proxy, useSnapshot } from "valtio";

interface VideoCreateStore {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const videoCreateStore = proxy<VideoCreateStore>({
  isSubmitting: false,
  setIsSubmitting: (value: boolean) => {
    videoCreateStore.isSubmitting = value;
  },
});

export const useVideoCreateStore = () => useSnapshot(videoCreateStore);
