import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useAuth } from "../../contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Users, UserPlus, Pencil, Trash2, ShieldCheck, ShieldOff, LogOut, Activity, ArrowLeft } from "lucide-react";
import type { UserWithoutPassword } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { UserMenu } from "../../components/user-menu";
import logoPath from "../../assets/san_agustin.jpg";

const roles = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin (Kapitan/Secretary)" },
  { value: "encoder", label: "Encoder (Treasurer)" },
  { value: "checker", label: "Checker (Bookkeeper)" },
  { value: "reviewer", label: "Reviewer (Council)" },
  { value: "approver", label: "Approver" },
];

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  fullName: z.string().min(1, "Full name is required"),
  position: z.string().min(1, "Position is required"),
  role: z.enum(["superadmin", "admin", "encoder", "checker", "reviewer", "approver"]),
  isActive: z.enum(["true", "false"]),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLocation("/login");
    }
  };

  // Redirect if not admin/superadmin
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col overflow-y-auto">
        {/* Barangay Header */}
        <div className="p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={logoPath} 
              alt="Barangay San Agustin Logo" 
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-sm font-bold text-foreground font-poppins leading-tight">
                Barangay San Agustin
              </h2>
              <p className="text-xs text-muted-foreground">Financial Monitoring System</p>
              <p className="text-xs text-muted-foreground">Iba, Zambales</p>
            </div>
          </div>
        </div>

        {/* Role Header */}
        <div className="px-4 py-3 border-b bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <h3 className="text-sm font-bold font-poppins text-foreground">Admin Panel</h3>
          <p className="text-xs text-muted-foreground">User Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Navigation
          </p>
          <div className="space-y-1">
            <Link href="/admin/users">
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer bg-blue-600 text-white shadow-sm"
                data-testid="nav-users"
              >
                <Users className="h-4 w-4" />
                Users
              </div>
            </Link>

            <Link href="/admin/activity-log">
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-foreground hover-elevate active-elevate-2"
                data-testid="nav-activity-log"
              >
                <Activity className="h-4 w-4" />
                Activity Log
              </div>
            </Link>
          </div>
          
          <div className="my-3 border-t border-border"></div>
          
          <div className="space-y-1">
            <Link href="/">
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-foreground hover-elevate active-elevate-2"
                data-testid="button-back-to-main"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main Page
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>

        {/* Footer with UserMenu */}
        <div className="p-3 border-t">
          <UserMenu />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}

export default function UserManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);

  // Fetch all users
  const { data: users, isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
  });

  // Form
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      position: "",
      role: "encoder",
      isActive: "true",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsDialogOpen(false);
      setEditingUser(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset({
      username: "",
      password: "",
      fullName: "",
      position: "",
      role: "encoder" as const,
      isActive: "true" as const,
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserWithoutPassword) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      password: "", // Don't show password
      fullName: user.fullName,
      position: user.position,
      role: user.role as any,
      isActive: user.isActive as any,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUserMutation.mutateAsync(id);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (editingUser) {
      // Update existing user
      const updateData: Partial<UserFormData> = {
        fullName: data.fullName,
        position: data.position,
        role: data.role,
        isActive: data.isActive,
      };
      
      // Only include password if it was changed
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }
      
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        data: updateData,
      });
    } else {
      // Create new user
      await createUserMutation.mutateAsync(data);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-poppins">User Management</h1>
            <p className="text-muted-foreground">Manage system users and their access</p>
          </div>
          <Button onClick={handleAddUser} data-testid="button-add-user">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {users?.length || 0} users registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading users...</p>
            ) : !users || users.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.position}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {roles.find((r) => r.value === user.role)?.label || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive === "true" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <ShieldOff className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user information and permissions"
                  : "Create a new user account with role-based access"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  disabled={!!editingUser}
                  data-testid="input-username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {editingUser && "(leave blank to keep current)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  data-testid="input-fullname"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  {...form.register("position")}
                  data-testid="input-position"
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) => form.setValue("role", value as any)}
                  defaultValue={form.getValues("role")}
                >
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  onValueChange={(value) => form.setValue("isActive", value as any)}
                  defaultValue={form.getValues("isActive")}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.isActive && (
                  <p className="text-sm text-destructive">{form.formState.errors.isActive.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  data-testid="button-save-user"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
