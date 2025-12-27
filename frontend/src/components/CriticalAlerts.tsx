import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { CriticalAlert } from "@/types/patient";
import { cn } from "@/lib/utils";

interface CriticalAlertsProps {
  alerts: CriticalAlert[];
}

const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={cn(
            alert.type === "Critical"
              ? "border-red-500 text-red-900 dark:border-red-700 dark:text-red-100"
              : "border-yellow-500 text-yellow-900 dark:border-yellow-700 dark:text-yellow-100",
            "bg-opacity-10"
          )}
        >
          {alert.type === "Critical" ? (
            <ExclamationTriangleIcon className="h-4 w-4" />
          ) : (
            <InfoCircledIcon className="h-4 w-4" />
          )}
          <AlertTitle className="font-semibold">{alert.type} Alert</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default CriticalAlerts;