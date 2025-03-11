import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 bg-aprycot-background relative overflow-hidden">
        {/* Food-themed background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full border-2 border-aprycot-primary rotate-12"></div>
          <div className="absolute top-40 right-20 w-20 h-20 rounded-full border-2 border-aprycot-success -rotate-12"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full border-2 border-aprycot-warning rotate-45"></div>
          <div className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full border-2 border-aprycot-info -rotate-12"></div>
          <div className="absolute bottom-40 right-10 w-16 h-16 rounded-full border-2 border-aprycot-danger rotate-12"></div>
          
          {/* Food icon patterns */}
          <div className="absolute top-60 left-40 text-aprycot-primary text-4xl">🍊</div>
          <div className="absolute top-20 right-40 text-aprycot-success text-4xl">🥑</div>
          <div className="absolute bottom-80 left-20 text-aprycot-warning text-4xl">🍋</div>
          <div className="absolute top-80 right-80 text-aprycot-info text-4xl">🫐</div>
          <div className="absolute bottom-20 right-40 text-aprycot-danger text-4xl">🍅</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl opacity-10">🥘</div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
        <Toaster />
      </main>
    </div>
  );
}
