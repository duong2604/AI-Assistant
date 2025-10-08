import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type ValidationStatus = "match" | "mismatch" | "missing" | "unknown";

interface StatusMeta {
  icon: LucideIcon;
  color: string; // text color
  bgColor: string; // background color (cho item)
  label: string;
}

const statusMap: Record<ValidationStatus, StatusMeta> = {
  match: {
    color: "#16a34a", // green-600
    bgColor: "#dcfce7", // green-100
    icon: CheckCircle,
    label: "Khớp",
  },
  mismatch: {
    color: "#dc2626", // red-600
    bgColor: "#fee2e2", // red-100
    icon: XCircle,
    label: "Sai lệch",
  },
  missing: {
    color: "#ca8a04", // yellow-600
    bgColor: "#fef9c3", // yellow-100
    icon: AlertTriangle,
    label: "Thiếu dữ liệu",
  },
  unknown: {
    color: "#4b5563", // gray-600
    bgColor: "#f3f4f6", // gray-100
    icon: HelpCircle,
    label: "Không xác định",
  },
};

export function getStatusMeta(status: ValidationStatus): StatusMeta {
  return statusMap[status] ?? statusMap.unknown;
}
