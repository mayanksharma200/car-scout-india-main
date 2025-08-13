import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

const ExportLeadsButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportLeads = async () => {
    setLoading(true);
    
    try {
      // Fetch all leads from the database
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          cars:interested_car_id (
            brand,
            model,
            variant
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert leads to CSV format
      const csvHeaders = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'City',
        'Status',
        'Source',
        'Timeline',
        'Budget Min',
        'Budget Max',
        'Interested Car',
        'API Sent',
        'Created At',
        'Updated At'
      ];

      const csvRows = leads?.map(lead => [
        lead.id,
        lead.name,
        lead.email,
        lead.phone,
        lead.city || '',
        lead.status,
        lead.source,
        lead.timeline || '',
        lead.budget_min || '',
        lead.budget_max || '',
        lead.cars ? `${lead.cars.brand} ${lead.cars.model} ${lead.cars.variant || ''}`.trim() : '',
        lead.api_sent ? 'Yes' : 'No',
        new Date(lead.created_at).toLocaleDateString(),
        new Date(lead.updated_at).toLocaleDateString()
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${leads?.length || 0} leads to CSV file`
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={exportLeads}
      disabled={loading}
      variant="outline"
    >
      <Download className="w-4 h-4 mr-2" />
      {loading ? "Exporting..." : "Export Leads"}
    </Button>
  );
};

export default ExportLeadsButton;