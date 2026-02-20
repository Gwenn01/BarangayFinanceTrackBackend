import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { TrendingUp, ClipboardCheck } from "lucide-react";
import { ReviewerLayout } from "../../components/reviewer-layout";

export default function ReviewerDashboard() {
  return (
    <ReviewerLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-poppins leading-tight">
            Reviewer Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review development fund projects in your committee
          </p>
        </div>

        {/* Module Card */}
        <div className="grid grid-cols-1 sm:max-w-md">
          <Link href="/reviewer/dfur">
            <Card
              className="hover-elevate active-elevate-2 cursor-pointer h-full transition-all active:scale-[0.98] touch-manipulation"
              data-testid="link-dfur-module"
            >
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-50 flex items-center justify-center mb-3 sm:mb-4">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <CardTitle className="text-base sm:text-xl leading-snug">
                  Development Fund Utilization Report
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Review DFUR projects assigned to your committee
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Click to review development fund projects
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Info Banner */}
        <Card className="bg-muted/50 border-muted-foreground/20">
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
            <div className="flex gap-3 items-start">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Reviewer Role (Barangay Kagawad):</strong> As a committee member, you review
                development fund utilization reports for projects under your committee's jurisdiction.
                Ensure that projects align with committee objectives and proper fund utilization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReviewerLayout>
  );
}