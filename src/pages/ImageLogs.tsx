import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuthenticatedApi } from "@/hooks/useAdminAuthenticatedApi";
import { Loader2, Image as ImageIcon, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ImageLog {
    id: string;
    user_id: string;
    car_id: string;
    source: string;
    image_count: number;
    cost: number;
    metadata: any;
    created_at: string;
    cars: {
        brand: string;
        model: string;
        variant: string;
    };
    profiles: {
        email: string;
        first_name: string;
        last_name: string;
    };
}

const ImageLogs = () => {
    const { toast } = useToast();
    const api = useAdminAuthenticatedApi();
    const [logs, setLogs] = useState<ImageLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ images: 0, cost: 0 });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.settings.getImageLogs(pagination.page, pagination.limit);
            if (response.success) {
                setLogs(response.data);
                if (response.totals) {
                    setTotals(response.totals);
                }
                setPagination(prev => ({
                    ...prev,
                    ...response.pagination
                }));
            }
        } catch (error) {
            console.error("Error fetching image logs:", error);
            toast({
                title: "Error",
                description: "Failed to load image logs",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <ImageIcon className="w-8 h-8" />
                            Image Generation Logs
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Track AI image generation usage and costs
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Images Generated
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totals.images}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Cost
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totals.cost.toFixed(4)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Generation History</CardTitle>
                        <CardDescription>
                            View all AI image generation requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Car</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Images</TableHead>
                                                <TableHead>Cost</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No logs found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                logs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="whitespace-nowrap">
                                                            {new Date(log.created_at).toLocaleString('en-IN', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {log.profiles?.first_name} {log.profiles?.last_name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {log.profiles?.email}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.cars ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{log.cars.brand} {log.cars.model}</span>
                                                                    <span className="text-xs text-muted-foreground">{log.cars.variant}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground italic">Car deleted</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {log.source.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{log.image_count}</TableCell>
                                                        <TableCell className="font-mono">
                                                            ${log.cost.toFixed(4)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ImageLogs;
