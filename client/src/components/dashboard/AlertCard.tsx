import { AlertCircle, AlertTriangle, CalendarX } from "lucide-react";

type AlertType = "danger" | "warning";

interface AlertCardProps {
  type: AlertType;
  message: string;
}

export default function AlertCard({ type, message }: AlertCardProps) {
  let bgColor = "bg-amber-50";
  let textColor = "text-amber-800";
  let Icon = AlertTriangle;

  if (type === "danger") {
    bgColor = "bg-red-50";
    textColor = "text-red-800";
    Icon = type === "danger" ? AlertCircle : CalendarX;
  }

  return (
    <div className={`flex items-center p-2 rounded-lg ${bgColor} ${textColor} mb-2`}>
      <Icon className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}
