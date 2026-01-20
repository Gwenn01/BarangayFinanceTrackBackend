import { LucideIcon } from "lucide-react";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradientFrom?: string;
  gradientTo?: string;
  testId?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  gradientFrom = "from-primary/5",
  gradientTo = "to-primary/10",
  testId
}: StatCardProps) {
  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br",
      gradientFrom,
      gradientTo,
      "border border-card-border shadow-lg"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <h3 
            className="text-3xl font-semibold text-foreground font-inter tracking-tight"
            data-testid={testId}
          >
            {value}
          </h3>
          {trend && (
            <p className={cn(
              "text-sm font-medium mt-2 flex items-center gap-1",
              trend.isPositive ? "text-chart-1" : "text-destructive"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
