import { ReactNode } from "react";
import Sidebar from "./Sidebar";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 bg-slate-100">
        {children}
      </main>
    </div>
  );
}
