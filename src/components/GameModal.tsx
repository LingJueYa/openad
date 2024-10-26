// 游戏模态框
import React from "react";
import { Button } from "@/components/ui/button";

// 定义属性接口
interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = React.memo(
  ({ isOpen, onClose }) => {
    // 如果模态框未打开,直接返回null
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-[500px] bg-[#1D1D1D] rounded-3xl overflow-hidden border border-gray-600/90">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-md font-semibold">恐龙游戏</h3>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl"
            >
              ×
            </Button>
          </div>
          <div className="p-4 rounded-xl">
            <iframe
              src="https://chromedino.com/"
              width="100%"
              height="300"
              frameBorder="0"
              title="Dinosaur Game"
            ></iframe>
          </div>
        </div>
      </div>
    );
  }
);

GameModal.displayName = 'GameModal';

export default GameModal;
