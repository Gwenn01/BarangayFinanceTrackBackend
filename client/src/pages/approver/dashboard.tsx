import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, TrendingUp, ShieldCheck } from "lucide-react";
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
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-poppins leading-tight">
            Approver Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Approve or reject financial transactions
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {modules.map((module) => (
            <Link key={module.id} href={module.href}>
              <Card
                className="hover-elevate active-elevate-2 cursor-pointer h-full transition-all active:scale-[0.98] touch-manipulation"
                data-testid={`link-${module.id}-module`}
              >
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-3 sm:mb-4`}
                  >
                    <module.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-base sm:text-xl leading-snug">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2 sm:pt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click to start approving transactions
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Banner */}
        <Card className="bg-muted/50 border-muted-foreground/20">
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
            <div className="flex gap-3 items-start">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Approver Role:</strong> Review all transactions carefully for accuracy and
                compliance. Approve transactions that are correct and complete. Reject transactions
                with errors or issues. Your approval is the final step before transactions are
                recorded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ApproverLayout>
  );
}