import { useState, useEffect } from "react";
import { Users, Search, Filter, MoreHorizontal, Phone, Mail, Calendar, Car, TrendingUp, MapPin, Eye, MessageSquare, ExternalLink, Edit, Trash2, IndianRupee, Briefcase, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  interested_car_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  source: string;
  status: string;
  api_sent: boolean;
  api_response: any;
  created_at: string;
  updated_at: string;
  employment_type?: string | null;
  monthly_income?: number | null;
  loan_amount?: number | null;
  emi_amount?: string | null;
  message?: string | null;
}

const LeadManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const limit = 20;

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: "created_at",
        sort_order: "desc",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);

      const response = await fetch(
        `/api/admin/leads?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const result = await response.json();

      if (result.success) {
        setLeads(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalLeads(result.pagination?.total || result.data.length);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, searchQuery, statusFilter, sourceFilter]);

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/admin/leads/${leadToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Lead deleted successfully");
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
        fetchLeads();
      } else {
        toast.error(result.error || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setViewDialogOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setLeadToEdit({ ...lead });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!leadToEdit) return;

    try {
      setSaving(true);
      const response = await fetch(
        `/api/admin/leads/${leadToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leadToEdit),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Lead updated successfully");
        setEditDialogOpen(false);
        setLeadToEdit(null);
        fetchLeads();
      } else {
        toast.error(result.error || "Failed to update lead");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'contacted':
        return <Badge className="bg-yellow-100 text-yellow-800">Contacted</Badge>;
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800">Qualified</Badge>;
      case 'lost':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceLabels: Record<string, string> = {
      'loan_comparison': 'Loan Comparison',
      'loan_preapproval': 'Loan Pre-approval',
      'request_quote': 'Request Quote',
      'get_best_price': 'Get Best Price',
      'website': 'Website',
      'comparison': 'Comparison',
      'emi_calculator': 'EMI Calculator',
    };

    return <Badge variant="outline">{sourceLabels[source] || source}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const filteredLeads = leads;

  const exportToCSV = async () => {
    try {
      // Fetch all leads with current filters (no pagination limit)
      const params = new URLSearchParams({
        page: "1",
        limit: "10000", // Get all leads
        sort_by: "created_at",
        sort_order: "desc",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);

      const response = await fetch(`/api/admin/leads?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch leads for export");
      }

      const result = await response.json();
      const allLeads = result.success ? result.data : [];

      if (allLeads.length === 0) {
        toast.error("No leads to export");
        return;
      }

      // Define CSV headers
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "City",
        "Source",
        "Status",
        "Car ID",
        "Budget Min",
        "Budget Max",
        "Timeline",
        "Employment Type",
        "Monthly Income",
        "Loan Amount",
        "EMI Amount",
        "Message",
        "API Sent",
        "Created At",
        "Updated At"
      ];

      // Convert leads to CSV rows
      const rows = allLeads.map((lead: Lead) => [
        lead.id,
        lead.name,
        lead.email,
        lead.phone,
        lead.city,
        lead.source,
        lead.status,
        lead.interested_car_id || "",
        lead.budget_min || "",
        lead.budget_max || "",
        lead.timeline || "",
        lead.employment_type || "",
        lead.monthly_income || "",
        lead.loan_amount || "",
        lead.emi_amount || "",
        lead.message ? lead.message.replace(/"/g, '""') : "", // Escape quotes
        lead.api_sent ? "Yes" : "No",
        formatDate(lead.created_at),
        formatDate(lead.updated_at)
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.map(h => `"${h}"`).join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${allLeads.length} leads to CSV`);
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error("Failed to export leads");
    }
  };

  const renderLeadTypeDetails = (lead: Lead) => {
    switch (lead.source) {
      case 'loan_comparison':
      case 'loan_preapproval':
        return (
          <div className="space-y-2 text-sm">
            {lead.employment_type && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{lead.employment_type}</span>
              </div>
            )}
            {lead.monthly_income && (
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <span>Income: {formatCurrency(lead.monthly_income)}/month</span>
              </div>
            )}
            {lead.loan_amount && (
              <p className="text-muted-foreground">Loan: {formatCurrency(lead.loan_amount)}</p>
            )}
            {lead.emi_amount && (
              <p className="text-muted-foreground">EMI: ₹{lead.emi_amount}</p>
            )}
          </div>
        );

      case 'request_quote':
      case 'get_best_price':
        return (
          <div className="space-y-2 text-sm">
            {lead.interested_car_id && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">{lead.interested_car_id}</span>
              </div>
            )}
            {(lead.budget_min || lead.budget_max) && (
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <span>
                  {lead.budget_min && lead.budget_max
                    ? `${formatCurrency(lead.budget_min)} - ${formatCurrency(lead.budget_max)}`
                    : lead.budget_min
                      ? formatCurrency(lead.budget_min)
                      : formatCurrency(lead.budget_max!)}
                </span>
              </div>
            )}
            {lead.timeline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{lead.timeline}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            {lead.interested_car_id && <p>Car ID: {lead.interested_car_id}</p>}
            {lead.timeline && <p className="capitalize">{lead.timeline}</p>}
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-muted-foreground">Track and manage customer inquiries and API integrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLeads}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</p>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leads.filter(l => l.status === 'qualified').length}</p>
                  <p className="text-sm text-muted-foreground">Qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leads.filter(l => l.api_sent).length}</p>
                  <p className="text-sm text-muted-foreground">API Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalLeads > 0 ? ((leads.filter(l => l.status === 'qualified').length / totalLeads) * 100).toFixed(1) : '0.0'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={(value) => {
                setSourceFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="loan_comparison">Loan Comparison</SelectItem>
                  <SelectItem value="loan_preapproval">Loan Pre-approval</SelectItem>
                  <SelectItem value="request_quote">Request Quote</SelectItem>
                  <SelectItem value="get_best_price">Get Best Price</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Info</TableHead>
                    <TableHead>Interest Details</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>API Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{lead.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{lead.city}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderLeadTypeDetails(lead)}
                        {lead.message && (
                          <p className="text-xs text-muted-foreground mt-2 italic">"{lead.message}"</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(lead.source)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.api_sent ? "default" : "outline"}>
                          {lead.api_sent ? '✓ Sent' : '⏳ Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(lead.created_at)}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(lead)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.location.href = `tel:${lead.phone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${lead.email}`}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Send to API
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add Note
                              </DropdownMenuItem> */}
                              <DropdownMenuItem onClick={() => handleEditClick(lead)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(lead)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {!loading && filteredLeads.length > 0 && (
              <div className="flex items-center justify-between border-t px-6 py-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, totalLeads)} of {totalLeads} leads
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details - {selectedLead?.name}</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedLead.name}</p>
                      <p><strong>Email:</strong> {selectedLead.email}</p>
                      <p><strong>Phone:</strong> {selectedLead.phone}</p>
                      <p><strong>City:</strong> {selectedLead.city}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Lead Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Source:</strong> {selectedLead.source}</p>
                      <p><strong>Status:</strong> {selectedLead.status}</p>
                      <p><strong>API Sent:</strong> {selectedLead.api_sent ? 'Yes' : 'No'}</p>
                      <p><strong>Created:</strong> {formatDate(selectedLead.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Type-specific details */}
                {(selectedLead.source === 'loan_comparison' || selectedLead.source === 'loan_preapproval') && (
                  <div>
                    <h3 className="font-semibold mb-3">Loan Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {selectedLead.employment_type && (
                        <p><strong>Employment:</strong> <span className="capitalize">{selectedLead.employment_type}</span></p>
                      )}
                      {selectedLead.monthly_income && (
                        <p><strong>Monthly Income:</strong> {formatCurrency(selectedLead.monthly_income)}</p>
                      )}
                      {selectedLead.loan_amount && (
                        <p><strong>Loan Amount:</strong> {formatCurrency(selectedLead.loan_amount)}</p>
                      )}
                      {selectedLead.emi_amount && (
                        <p><strong>EMI:</strong> ₹{selectedLead.emi_amount}</p>
                      )}
                    </div>
                  </div>
                )}

                {(selectedLead.source === 'request_quote' || selectedLead.source === 'get_best_price') && (
                  <div>
                    <h3 className="font-semibold mb-3">Car Interest</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {selectedLead.interested_car_id && (
                        <p><strong>Car ID:</strong> {selectedLead.interested_car_id}</p>
                      )}
                      {(selectedLead.budget_min || selectedLead.budget_max) && (
                        <p><strong>Budget:</strong>{' '}
                          {selectedLead.budget_min && selectedLead.budget_max
                            ? `${formatCurrency(selectedLead.budget_min)} - ${formatCurrency(selectedLead.budget_max)}`
                            : selectedLead.budget_min
                              ? formatCurrency(selectedLead.budget_min)
                              : formatCurrency(selectedLead.budget_max!)}
                        </p>
                      )}
                      {selectedLead.timeline && (
                        <p><strong>Timeline:</strong> <span className="capitalize">{selectedLead.timeline}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {selectedLead.message && (
                  <div>
                    <h3 className="font-semibold mb-3">Message</h3>
                    <p className="text-sm bg-muted p-3 rounded">{selectedLead.message}</p>
                  </div>
                )}

                {selectedLead.api_response && (
                  <div>
                    <h3 className="font-semibold mb-3">API Response</h3>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLead.api_response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Lead Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            {leadToEdit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={leadToEdit.name}
                      onChange={(e) => setLeadToEdit({ ...leadToEdit, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={leadToEdit.email}
                      onChange={(e) => setLeadToEdit({ ...leadToEdit, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={leadToEdit.phone}
                      onChange={(e) => setLeadToEdit({ ...leadToEdit, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={leadToEdit.city}
                      onChange={(e) => setLeadToEdit({ ...leadToEdit, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={leadToEdit.status}
                      onValueChange={(value) => setLeadToEdit({ ...leadToEdit, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Source</label>
                    <Input
                      value={leadToEdit.source}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                {(leadToEdit.source === 'loan_comparison' || leadToEdit.source === 'loan_preapproval') && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Loan Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Employment Type</label>
                        <Input
                          value={leadToEdit.employment_type || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, employment_type: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Monthly Income</label>
                        <Input
                          type="number"
                          value={leadToEdit.monthly_income || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, monthly_income: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Loan Amount</label>
                        <Input
                          type="number"
                          value={leadToEdit.loan_amount || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, loan_amount: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">EMI Amount</label>
                        <Input
                          value={leadToEdit.emi_amount || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, emi_amount: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(leadToEdit.source === 'request_quote' || leadToEdit.source === 'get_best_price') && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Car Interest</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Budget Min</label>
                        <Input
                          type="number"
                          value={leadToEdit.budget_min || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, budget_min: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Budget Max</label>
                        <Input
                          type="number"
                          value={leadToEdit.budget_max || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, budget_max: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Timeline</label>
                        <Input
                          value={leadToEdit.timeline || ''}
                          onChange={(e) => setLeadToEdit({ ...leadToEdit, timeline: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {leadToEdit.message && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="w-full mt-2 p-2 border rounded-md"
                      rows={3}
                      value={leadToEdit.message || ''}
                      onChange={(e) => setLeadToEdit({ ...leadToEdit, message: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the lead for "{leadToDelete?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default LeadManagement;
