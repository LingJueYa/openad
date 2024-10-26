// 生成中的模态框组件
import React from "react";
import { Button } from "@/components/ui/button";

// 定义属性接口
interface GeneratingModalProps {
  isOpen: boolean;
  onPlayGame: () => void;
}

const GeneratingModal: React.FC<GeneratingModalProps> = React.memo(
  ({ isOpen, onPlayGame }) => {
    // 如果模态框未打开,直接返回null
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-40">
        <div className="bg-[#1D1D1D] rounded-3xl p-8 w-96 text-center border-2 border-gray-600/90">
          <div className="flex justify-center mb-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-bounce"
                style={{ animationDelay: `${index * 0.2}s` }}
              ></div>
            ))}
          </div>
          <h2 className="text-xl font-bold mb-2">生成需要一点时间</h2>
          <p className="mb-6">等待过程中可以玩游戏哦~</p>
          {/* 游戏按钮 */}
          <Button
            onClick={onPlayGame}
            className="w-full bg-gradient-to-r from-[#2071fc] to-[#e7dbe4] text-black font-semibold py-3 rounded-xl"
          >
            去玩游戏
          </Button>
        </div>
      </div>
    );
  }
);

GeneratingModal.displayName = "GeneratingModal";

export default GeneratingModal;
