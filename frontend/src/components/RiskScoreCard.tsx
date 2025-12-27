import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskScore } from "@/types/patient";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  score: RiskScore;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ score }) => {
  const getCategoryClasses = (category: RiskScore['category']) => {
    switch (category) {
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{score.name}</CardTitle>
        <Badge className={cn("text-xs", getCategoryClasses(score.category))}>
          {score.category}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{score.score}</div>
        {score.details && (
          <p className="text-xs text-muted-foreground mt-1">{score.details}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;