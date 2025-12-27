import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Recommendation } from "@/types/patient";

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  onRecommendationToggle: (id: string, checked: boolean) => void;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendations,
  onRecommendationToggle,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific recommendations at this time.</p>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="flex items-center space-x-2">
              <Checkbox
                id={`rec-${rec.id}`}
                checked={rec.checked}
                onCheckedChange={(checked) => onRecommendationToggle(rec.id, !!checked)}
              />
              <Label htmlFor={`rec-${rec.id}`} className="text-sm font-normal cursor-pointer">
                {rec.text}
                {rec.category && (
                  <span className="ml-2 text-xs text-muted-foreground">({rec.category})</span>
                )}
              </Label>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;