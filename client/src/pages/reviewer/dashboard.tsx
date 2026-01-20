import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { TrendingUp } from "lucide-react";
import { ReviewerLayout } from "../../components/reviewer-layout";

export default function ReviewerDashboard() {
  return (
    <ReviewerLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Reviewer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review development fund projects in your committee</p>
        </div>

        <div className="grid grid-cols-1 max-w-md">
          <Link href="/reviewer/dfur">
            <Card className="hover-elevate active-elevate-2 cursor-pointer h-full transition-all" data-testid="link-dfur-module">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Development Fund Utilization Report</CardTitle>
                <CardDescription className="text-base">Review DFUR projects assigned to your committee</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to review development fund projects
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="bg-muted/50 border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Reviewer Role (Barangay Kagawad):</strong> As a committee member, you review 
              development fund utilization reports for projects under your committee's jurisdiction. 
              Ensure that projects align with committee objectives and proper fund utilization.
            </p>
          </CardContent>
        </Card>
      </div>
    </ReviewerLayout>
  );
}
