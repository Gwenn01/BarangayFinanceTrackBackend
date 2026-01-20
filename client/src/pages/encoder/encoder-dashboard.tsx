import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, DollarSign, TrendingUp } from "lucide-react";
import { EncoderLayout } from "../../components/encoder-layout";

const encoderModules = [
  {
    id: "abo",
    title: "Annual Budget Ordinance",
    abbreviation: "ABO",
    description: "Encode annual budget ordinance and appropriations",
    icon: DollarSign,
    url: "/encoder/abo",
    color: "from-chart-1/10 to-chart-1/20",
    iconColor: "text-chart-1",
  },
  {
    id: "sre",
    title: "Statement of Receipts and Expenditures",
    abbreviation: "SRE",
    description: "Encode receipts and expenditure records",
    icon: FileText,
    url: "/encoder/sre",
    color: "from-chart-2/10 to-chart-2/20",
    iconColor: "text-chart-2",
  },
  {
    id: "dfur",
    title: "Development Fund Utilization Report",
    abbreviation: "DFUR",
    description: "Encode development fund utilization data",
    icon: TrendingUp,
    url: "/encoder/dfur",
    color: "from-chart-3/10 to-chart-3/20",
    iconColor: "text-chart-3",
  },
];

export default function EncoderDashboard() {
  return (
    <EncoderLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Encoder Dashboard</h1>
          <p className="text-muted-foreground mt-1">Select a module to begin encoding financial data</p>
        </div>

      <div className="grid gap-6 md:grid-cols-3">
        {encoderModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.id} href={module.url}>
              <Card 
                className={`cursor-pointer hover-elevate active-elevate-2 border-2 border-card-border hover:border-primary/50 bg-gradient-to-br ${module.color} h-full`}
                data-testid={`card-module-${module.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-lg bg-background/80 p-3`}>
                      <Icon className={`h-8 w-8 ${module.iconColor}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
                      {module.abbreviation}
                    </span>
                  </div>
                  <CardTitle className="font-poppins text-xl">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="bg-muted/50 border-muted-foreground/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Encoder Role:</strong> You have permission to input and manage financial data entries. 
            Please ensure all data is accurate and complete before submission. Your entries will be reviewed 
            by the Checker before final approval.
          </p>
        </CardContent>
      </Card>
    </div>
    </EncoderLayout>
  );
}
