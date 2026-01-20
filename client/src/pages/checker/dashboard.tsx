import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, TrendingUp } from "lucide-react";
import { CheckerLayout } from "../../components/checker-layout";

export default function CheckerDashboard() {
  const modules = [
    {
      id: "sre",
      title: "Statement of Receipts & Expenditures",
      description: "Review and verify collection and disbursement transactions",
      icon: FileText,
      href: "/checker/sre",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "dfur",
      title: "Development Fund Utilization Report",
      description: "Review development fund utilization and allocations",
      icon: TrendingUp,
      href: "/checker/dfur",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <CheckerLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Checker Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review and verify financial transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Link key={module.id} href={module.href}>
              <Card className="hover-elevate active-elevate-2 cursor-pointer h-full transition-all" data-testid={`link-${module.id}-module`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <module.icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription className="text-base">{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to start reviewing transactions
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-muted/50 border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Checker Role:</strong> Review all transactions carefully for accuracy and compliance. 
              Flag transactions with errors using the red flag feature. Leave detailed comments explaining any 
              issues found. All flagged transactions will be reviewed by the Approver.
            </p>
          </CardContent>
        </Card>
      </div>
    </CheckerLayout>
  );
}
