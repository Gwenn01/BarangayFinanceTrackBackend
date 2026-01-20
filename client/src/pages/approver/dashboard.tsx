import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, TrendingUp } from "lucide-react";
import { ApproverLayout } from "../../components/approver-layout";

export default function ApproverDashboard() {
  const modules = [
    {
      id: "sre",
      title: "Statement of Receipts & Expenditures",
      description: "Approve or reject collection and disbursement transactions",
      icon: FileText,
      href: "/approver/sre",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "dfur",
      title: "Development Fund Utilization Report",
      description: "Approve development fund utilization and allocations",
      icon: TrendingUp,
      href: "/approver/dfur",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <ApproverLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Approver Dashboard</h1>
          <p className="text-muted-foreground mt-1">Approve or reject financial transactions</p>
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
                    Click to start approving transactions
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-muted/50 border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Approver Role:</strong> Review all transactions carefully for accuracy and compliance. 
              Approve transactions that are correct and complete. Reject transactions with errors or issues.
              Your approval is the final step before transactions are recorded.
            </p>
          </CardContent>
        </Card>
      </div>
    </ApproverLayout>
  );
}
