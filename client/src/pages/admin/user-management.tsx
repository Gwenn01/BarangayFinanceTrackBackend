import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
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
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  LogOut,
  Activity,
  ArrowLeft,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { UserMenu } from "../../components/user-menu";
import { useToast } from "../../hooks/use-toast";
import { api, apiCall } from "../../utils/api";
import logoPath from "../../assets/san_agustin.jpg";

/* -------------------- TYPES -------------------- */

type UserRole =
  | "superadmin"
  | "admin"
  | "encoder"
  | "checker"
  | "reviewer"
  | "approver"
  | "viewer";

type User = {
  id: number;
  username: string;
  full_name: string;
  position: string;
  role: UserRole;
  is_active: boolean;
};

type UserFormData = {
  user_id?: number;
  username: string;
  password?: string;
  fullname: string;
  position: string;
  role: UserRole;
  is_active: "active" | "inactive";
};

/* -------------------- STATIC DATA -------------------- */

const roles = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin (Kapitan/Secretary)" },
  { value: "encoder", label: "Encoder (Treasurer)" },
  { value: "checker", label: "Checker (Bookkeeper)" },
  { value: "reviewer", label: "Reviewer (Council)" },
  { value: "approver", label: "Approver" },
  { value: "viewer", label: "Viewer" },
];

/* -------------------- LAYOUT -------------------- */

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: "users" | "activity";
}

function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    logout?.();
    setLocation("/login");
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src={logoPath}
            alt="Barangay Logo"
            className="h-12 w-12 rounded-full flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate">Barangay San Agustin</h2>
            <p className="text-xs text-muted-foreground truncate">
              Financial Monitoring System
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-bold font-poppins">Admin Panel</h3>
        <p className="text-xs text-muted-foreground">
          {currentPage === "users" ? "User Management" : "Activity Log"}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <Link href="/admin/users">
          <div
            className="flex items-center gap-2 p-2 rounded bg-blue-600 text-white cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <Users className="h-4 w-4 flex-shrink-0" /> Users
          </div>
        </Link>

        <Link href="/admin/activity-log">
          <div
            className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <Activity className="h-4 w-4 flex-shrink-0" /> Activity Log
          </div>
        </Link>

        <Link href="/">
          <div
            className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" /> Back to Main
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 text-destructive w-full text-left"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" /> Logout
        </button>
      </nav>

      <div className="border-t p-3 flex items-center justify-start">
        <UserMenu />
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-card border-r flex flex-col transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-2 border-b">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={logoPath}
              alt="Barangay Logo"
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
            <span className="text-sm font-bold truncate">Admin Panel</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

/* -------------------- MOBILE USER CARD -------------------- */

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  const badgeVariant = (role: string) =>
    role === "admin" || role === "superadmin" ? "secondary" : "outline";

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold truncate">{user.full_name}</p>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(user)}
            title="Edit user"
            className="h-8 w-8"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(user)}
            disabled={!user.is_active}
            title="Deactivate user"
            className="h-8 w-8"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant={badgeVariant(user.role)} className="text-xs">
          {roles.find((r) => r.value === user.role)?.label || user.role}
        </Badge>
        {user.is_active ? (
          <div className="flex items-center gap-1 text-green-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-xs">Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <ShieldOff className="h-3.5 w-3.5" />
            <span className="text-xs">Inactive</span>
          </div>
        )}
      </div>

      {user.position && (
        <p className="text-xs text-muted-foreground truncate">
          {user.position}
        </p>
      )}
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    defaultValues: {
      username: "",
      password: "",
      fullname: "",
      position: "",
      role: "encoder",
      is_active: "active",
    },
  });

  /* -------------------- FETCH USERS -------------------- */
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiCall<User[]>(api.users.getAll, {
        method: "GET",
      });

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error });
        return;
      }

      if (data) setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* -------------------- HANDLERS -------------------- */

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset({
      username: "",
      password: "",
      fullname: "",
      position: "",
      role: "encoder",
      is_active: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      user_id: user.id,
      username: user.username,
      password: "",
      fullname: user.full_name,
      position: user.position,
      role: user.role,
      is_active: user.is_active ? "active" : "inactive",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.username}?`))
      return;

    try {
      const { data, error } = await apiCall(api.users.delete, {
        method: "PUT",
        body: JSON.stringify({ user_id: user.id }),
      });

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error });
        return;
      }

      toast({ title: "Success", description: "User deactivated successfully" });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deactivate user",
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      if (editingUser) {
        const payload: any = {
          user_id: data.user_id,
          fullname: data.fullname,
          position: data.position,
          role: data.role,
          is_active: data.is_active,
        };

        if (data.password && data.password.trim() !== "") {
          payload.password = data.password;
        }

        const { error } = await apiCall(api.users.edit, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (error) {
          toast({ variant: "destructive", title: "Error", description: error });
          return;
        }

        toast({ title: "Success", description: "User updated successfully" });
      } else {
        if (!data.password || data.password.trim() === "") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Password is required for new users",
          });
          return;
        }

        const { error } = await apiCall(api.users.add, {
          method: "POST",
          body: JSON.stringify({
            username: data.username,
            password: data.password,
            fullname: data.fullname,
            position: data.position,
            role: data.role,
            is_active: data.is_active,
          }),
        });

        if (error) {
          toast({ variant: "destructive", title: "Error", description: error });
          return;
        }

        toast({ title: "Success", description: "User added successfully" });
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const badgeVariant = (role: string) =>
    role === "admin" || role === "superadmin" ? "secondary" : "outline";

  return (
    <AdminLayout currentPage="users">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage system users and access
            </p>
          </div>
          <Button onClick={handleAddUser} disabled={isLoading} size="sm" className="flex-shrink-0">
            <UserPlus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">All Users</CardTitle>
            <CardDescription>
              {isLoading ? "Loading..." : `${users.length} users`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                No users found
              </div>
            ) : (
              <>
                {/* Mobile: Card List */}
                <div className="md:hidden space-y-3 px-4 pb-4">
                  {users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block">
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
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.username}
                          </TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.position}</TableCell>
                          <TableCell>
                            <Badge variant={badgeVariant(user.role)}>
                              {roles.find((r) => r.value === user.role)
                                ?.label || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.is_active ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-sm">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-600">
                                <ShieldOff className="h-4 w-4" />
                                <span className="text-sm">Inactive</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditUser(user)}
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteUser(user)}
                              disabled={!user.is_active}
                              title="Deactivate user"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Enter username"
                  {...form.register("username", {
                    required: "Username is required",
                  })}
                  disabled={!!editingUser}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password{" "}
                  {editingUser && (
                    <span className="text-muted-foreground font-normal">
                      (leave blank to keep current)
                    </span>
                  )}
                </label>
                <Input
                  type="password"
                  placeholder={
                    editingUser ? "Enter new password" : "Enter password"
                  }
                  {...form.register("password", {
                    required: editingUser ? false : "Password is required",
                  })}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  {...form.register("fullname", {
                    required: "Full name is required",
                  })}
                />
                {form.formState.errors.fullname && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.fullname.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  placeholder="Enter position"
                  {...form.register("position", {
                    required: "Position is required",
                  })}
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.position.message}
                  </p>
                )}
              </div>

              {/* Role & Status side by side on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    onValueChange={(v) => form.setValue("role", v as UserRole)}
                    defaultValue={form.getValues("role")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    onValueChange={(v) =>
                      form.setValue("is_active", v as "active" | "inactive")
                    }
                    defaultValue={form.getValues("is_active")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingUser ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingUser ? "Update User" : "Create User"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}