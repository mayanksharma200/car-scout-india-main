import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const UpdateCarImages = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateImages = async () => {
    setIsUpdating(true);
    console.log('Starting car image update...');
    
    try {
      console.log('Calling update-car-images function...');
      const { data, error } = await supabase.functions.invoke('update-car-images', {
        body: {}
      });
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Error updating car images:', error);
        toast.error(`Failed to update car images: ${error.message}`);
      } else if (data) {
        console.log('Car images updated successfully:', data);
        toast.success(`Updated images for ${data.updatedCount} car models`);
        // Reload the page to show updated images
        window.location.reload();
      } else {
        console.log('No data returned from function');
        toast.error('No response from update function');
      }
    } catch (error: any) {
      console.error('Error calling update function:', error);
      toast.error(`Failed to update car images: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdateImages}
      disabled={isUpdating}
      variant="outline"
    >
      {isUpdating ? 'Updating Images...' : 'Update Car Images'}
    </Button>
  );
};