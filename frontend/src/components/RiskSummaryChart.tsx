import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { RiskScore } from "@/types/patient";

interface RiskSummaryChartProps {
  riskScores: RiskScore[];
}

const COLORS = {
  Low: "#22c55e", // Green
  Moderate: "#eab308", // Yellow
  High: "#ef4444", // Red
};

const RiskSummaryChart: React.FC<RiskSummaryChartProps> = ({ riskScores }) => {
  // Aggregate risk scores by category
  const data = riskScores.reduce((acc, score) => {
    const category = score.category;
    const existing = acc.find((item) => item.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Sort data to ensure consistent color mapping (e.g., High, Moderate, Low)
  data.sort((a, b) => {
    if (a.name === "High") return -1;
    if (b.name === "High") return 1;
    if (a.name === "Moderate" && b.name === "Low") return -1;
    if (a.name === "Low" && b.name === "Moderate") return 1;
    return 0;
  });

  if (riskScores.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Risk Category Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No risk scores available to summarize.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Risk Category Summary</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RiskSummaryChart;