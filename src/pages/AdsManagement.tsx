import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuthenticatedApi } from "@/hooks/useAdminAuthenticatedApi";
import { Loader2, Save, ExternalLink } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const AdsManagement = () => {
    const { toast } = useToast();
    const api = useAdminAuthenticatedApi();
    const [adScriptUrl, setAdScriptUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        fetchAdScriptUrl();
    }, []);

    const fetchAdScriptUrl = async () => {
        try {
            setLoading(true);
            const response = await api.settings.get("ad_script_url");
            if (response.success) {
                setAdScriptUrl(response.data.setting_value);
                setLastUpdated(response.data.updated_at);
            }
        } catch (error) {
            console.error("Error fetching ad script URL:", error);
            toast({
                title: "Error",
                description: "Failed to load ad script URL",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!adScriptUrl.trim()) {
            toast({
                title: "Error",
                description: "Ad script URL cannot be empty",
                variant: "destructive",
            });
            return;
        }

        // Basic URL validation
        try {
            new URL(adScriptUrl);
        } catch {
            toast({
                title: "Error",
                description: "Please enter a valid URL",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            const response = await api.settings.update("ad_script_url", adScriptUrl);
            if (response.success) {
                setLastUpdated(response.data.updated_at);
                toast({
                    title: "Success",
                    description: "Ad script URL updated successfully",
                });
            }
        } catch (error) {
            console.error("Error updating ad script URL:", error);
            toast({
                title: "Error",
                description: "Failed to update ad script URL",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Ads Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure the Google Publisher Tag (GPT) script URL for your advertisements
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ad Script Configuration</CardTitle>
                        <CardDescription>
                            Update the URL for the Google Publisher Tag script. Changes will take effect immediately across the site.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="adScriptUrl">Ad Script URL</Label>
                            <Input
                                id="adScriptUrl"
                                type="url"
                                placeholder="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
                                value={adScriptUrl}
                                onChange={(e) => setAdScriptUrl(e.target.value)}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the complete URL for the ad script (e.g., Google Publisher Tag)
                            </p>
                        </div>

                        {lastUpdated && (
                            <div className="text-sm text-muted-foreground">
                                Last updated: {new Date(lastUpdated).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>

                            {/* {adScriptUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(adScriptUrl, '_blank')}
                                    className="gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Test URL
                                </Button>
                            )} */}
                        </div>

                        <div className="bg-muted p-4 rounded-md">
                            <h3 className="font-semibold text-sm mb-2">ℹ️ Important Notes:</h3>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>The URL must be a valid HTTPS URL</li>
                                <li>Changes take effect immediately for new page loads</li>
                                <li>Users may need to refresh their browser to see changes</li>
                                <li>Make sure the script URL is from a trusted source</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdsManagement;
