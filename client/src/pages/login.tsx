import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import logoPath from "../assets/san_agustin.jpg";
import { LogIn, ArrowLeft } from "lucide-react";
import type { UserWithoutPassword } from "../../../shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json() as { user: UserWithoutPassword };
      const user = result.user;

      toast({
        title: "Welcome!",
        description: `Logged in as ${user.fullName}`,
      });

      // Redirect based on user role
      const roleRoutes: Record<string, string> = {
        superadmin: "/admin/users",
        admin: "/admin/users",
        encoder: "/encoder/dashboard",
        checker: "/checker/dashboard",
        reviewer: "/reviewer/dashboard",
        approver: "/approver/dashboard",
      };

      const redirectPath = roleRoutes[user.role] || "/";
      setLocation(redirectPath);

      // Reload to trigger auth context update
      window.location.href = redirectPath;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src={logoPath} 
              alt="Barangay San Agustin Logo" 
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-poppins">Barangay San Agustin</CardTitle>
            <CardDescription className="text-base">Financial Monitoring System</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">Iba, Zambales</p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        {...field}
                        data-testid="input-username"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Enter your password" 
                        {...field}
                        data-testid="input-password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Please contact your administrator if you need access</p>
            </div>
            
            <Link href="/">
              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-back-to-main"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
