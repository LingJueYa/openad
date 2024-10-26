// LayOut

// 导入配置文件
import { siteMetadata } from "@/config/site";
// 导入工具函数
import { cn } from "@/lib/utils";
// 导入全局样式
import "../styles/globals.css";
// 导入字体
import { Inter } from "next/font/google";
// 导入组件
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

// 配置 Inter 字体
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  ...siteMetadata,
  viewport: "width=device-width,initial-scale=1, maximum-scale=5",
};

// 根布局组件
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={inter.variable}>
      <head>
        {/* 添加安全相关的 meta 标签 */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground",
          "antialiased",
          "flex flex-col"
        )}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
