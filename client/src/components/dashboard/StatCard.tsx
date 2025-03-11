import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  borderColor: string; // tailwind class e.g. 'border-primary'
  iconBgColor: string; // tailwind class e.g. 'bg-primary'
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  borderColor = "border-primary", 
  iconBgColor = "bg-primary" 
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${iconBgColor} bg-opacity-10 p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
