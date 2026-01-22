import { useState, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  FileEdit, 
  CheckCircle, 
  UserCheck, 
  ClipboardCheck, 
  Eye,
  Shield
} from "lucide-react";
import logoPath from "../assets/san_agustin.jpg";
//import barangayHallPath from "@assets/IMG_20251102_172947_819_1762095297396.jpg";

const roles = [
  {
    id: "admin",
    title: "Admin",
    description: "Manage users, system settings, and full access control",
    icon: Shield,
    color: "from-blue-500/10 to-blue-500/20",
    iconColor: "text-blue-600",
  },
  {
    id: "encoder",
    title: "Encoder",
    description: "Input and manage financial transactions and records",
    icon: FileEdit,
    color: "from-chart-1/10 to-chart-1/20",
    iconColor: "text-chart-1",
  },
  {
    id: "checker",
    title: "Checker",
    description: "Verify accuracy of financial data entries",
    icon: CheckCircle,
    color: "from-chart-2/10 to-chart-2/20",
    iconColor: "text-chart-2",
  },
  {
    id: "approver",
    title: "Approver",
    description: "Review and approve financial transactions",
    icon: UserCheck,
    color: "from-chart-3/10 to-chart-3/20",
    iconColor: "text-chart-3",
  },
  {
    id: "reviewer",
    title: "Reviewer",
    description: "Conduct comprehensive financial audits and reviews",
    icon: ClipboardCheck,
    color: "from-chart-4/10 to-chart-4/20",
    iconColor: "text-chart-4",
  },
  {
    id: "viewer",
    title: "Viewer",
    description: "View financial reports and dashboards",
    icon: Eye,
    color: "from-chart-5/10 to-chart-5/20",
    iconColor: "text-chart-5",
  },
];

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    localStorage.setItem("userRole", roleId);
    setTimeout(() => {
      // Redirect to role-specific dashboard or login
      if (roleId === "admin") {
        setLocation("/login"); // Admin needs to login first
      } else if (roleId === "encoder") {
        setLocation("/encoder/dashboard");
      } else if (roleId === "checker") {
        setLocation("/checker/dashboard");
      } else if (roleId === "approver") {
        setLocation("/approver/dashboard");
      } else if (roleId === "reviewer") {
        setLocation("/reviewer/dashboard");
      } else if (roleId === "viewer") {
        setLocation("/viewer/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, roleId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoleSelect(roleId);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Hero Section with Barangay Hall Background */}
      <div className="relative h-64 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          //style={{ backgroundImage: `url(${barangayHallPath})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />
        
        <div className="relative flex h-full items-center justify-center px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={logoPath} 
                alt="Barangay San Agustin Logo" 
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/20"
              />
            </div>
            <h1 className="text-4xl font-bold text-white font-poppins tracking-tight mb-2">
              Barangay San Agustin
            </h1>
            <p className="text-xl text-white/90 font-medium">
              Financial Monitoring System
            </p>
            <p className="text-sm text-white/80 mt-1">
              Iba, Zambales
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground font-poppins mb-3">
            Select Your Role
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose your role to access the financial monitoring system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer hover-elevate active-elevate-2 border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  selectedRole === role.id 
                    ? 'border-primary shadow-lg' 
                    : 'border-card-border hover:border-primary/50'
                } bg-gradient-to-br ${role.color}`}
                onClick={() => handleRoleSelect(role.id)}
                onKeyDown={(e) => handleKeyDown(e, role.id)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${role.title} role: ${role.description}`}
                data-testid={`card-role-${role.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-lg bg-background/80 p-3`}>
                      <Icon className={`h-8 w-8 ${role.iconColor}`} />
                    </div>
                  </div>
                  <CardTitle className="font-poppins text-xl">
                    {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-muted/50 border-muted-foreground/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your role determines the level of access and permissions 
                you have within the financial monitoring system. Select the appropriate role 
                assigned to you by the barangay administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
