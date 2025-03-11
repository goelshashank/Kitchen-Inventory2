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
      <main className="flex-1 p-4 lg:p-8 bg-aprycot-background">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
        <Toaster />
      </main>
    </div>
  );
}
