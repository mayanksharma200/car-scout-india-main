import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2, Edit, UserCheck, UserX, Mail, Calendar, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  role: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({ first_name: "", last_name: "", phone: "", city: "", role: "" });
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const limit = 20;

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (roleFilter && roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      const response = await fetch(`/api/admin/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalUsers(result.pagination.total);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
        setShowDeleteDialog(false);
        setSelectedUser(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting user",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        fetchUsers();
        setShowEditDialog(false);
        setSelectedUser(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating user",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        "Email",
        "First Name",
        "Last Name",
        "Phone",
        "City",
        "Role",
        "Email Verified",
        "Active",
        "Created At",
        "Updated At"
      ];

      // Prepare CSV rows
      const rows = users.map(user => [
        user.email,
        user.first_name || "",
        user.last_name || "",
        user.phone || "",
        user.city || "",
        user.role,
        user.email_verified ? "Yes" : "No",
        user.is_active ? "Yes" : "No",
        new Date(user.created_at).toLocaleString(),
        new Date(user.updated_at).toLocaleString()
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Exported ${users.length} users to CSV`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage all registered users and their profiles
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="w-full md:w-auto"
                disabled={users.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === "user").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({totalUsers})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.first_name || user.last_name ? (
                              `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            ) : (
                              <span className="text-muted-foreground italic">
                                Not set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.phone || (
                              <span className="text-muted-foreground italic">
                                Not set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.city || (
                              <span className="text-muted-foreground italic">
                                Not set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getRoleBadgeColor(user.role)}
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(user.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditFormData({
                                    first_name: user.first_name || "",
                                    last_name: user.last_name || "",
                                    phone: user.phone || "",
                                    city: user.city || "",
                                    role: user.role,
                                  });
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone and will permanently delete the user account and all
                associated data.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="py-4">
                <p className="text-sm">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm">
                  <strong>Name:</strong>{" "}
                  {selectedUser.first_name || selectedUser.last_name
                    ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim()
                    : "Not set"}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {selectedUser.phone || "Not set"}
                </p>
                <p className="text-sm">
                  <strong>City:</strong> {selectedUser.city || "Not set"}
                </p>
                <p className="text-sm">
                  <strong>Role:</strong> {selectedUser.role}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user profile information
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email (read-only)
                  </label>
                  <Input value={selectedUser.email} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    First Name
                  </label>
                  <Input
                    value={editFormData.first_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        first_name: e.target.value,
                      })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Last Name
                  </label>
                  <Input
                    value={editFormData.last_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        last_name: e.target.value,
                      })
                    }
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone
                  </label>
                  <Input
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    City
                  </label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        city: e.target.value,
                      })
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={updating}>
                {updating ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagement;
