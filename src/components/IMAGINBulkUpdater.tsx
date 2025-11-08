import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Image, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface CarResult {
  car_id: string;
  car_name: string;
  status: string;
  images_count?: number;
  primary_image?: string;
  error?: string;
}

interface BulkUpdateResponse {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  results: CarResult[];
  errors: CarResult[];
  pagination: {
    limit: number;
    offset: number;
    remaining: number;
    hasMore: boolean;
  };
}

const IMAGINBulkUpdater = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalSuccessful, setTotalSuccessful] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [results, setResults] = useState<CarResult[]>([]);
  const [errors, setErrors] = useState<CarResult[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentBatch, setCurrentBatch] = useState<BulkUpdateResponse | null>(null);

  const BATCH_SIZE = 10;
  const API_URL = "http://localhost:3001"; // Adjust based on your backend URL

  const startBulkUpdate = async () => {
    if (!confirm("Start IMAGIN bulk update? This will process cars in batches of 10.")) {
      return;
    }

    setIsRunning(true);
    setCurrentOffset(0);
    setTotalProcessed(0);
    setTotalSuccessful(0);
    setTotalFailed(0);
    setResults([]);
    setErrors([]);
    setCurrentBatch(null);
    
    toast.info("Starting IMAGIN bulk update...");
    await processBatch(0);
  };

  const processBatch = async (offset: number) => {
    try {
      console.log(`🔄 Processing batch at offset ${offset}`);
      
      const response = await fetch(`${API_URL}/api/admin/cars/imagin-bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: BATCH_SIZE,
          offset: offset
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BulkUpdateResponse = await response.json();
      console.log('Batch response:', data);

      // Update state
      setCurrentBatch(data);
      setTotalProcessed(prev => prev + data.processed);
      setTotalSuccessful(prev => prev + data.successful);
      setTotalFailed(prev => prev + data.failed);
      setResults(prev => [...prev, ...data.results]);
      setErrors(prev => [...prev, ...data.errors]);
      setHasMore(data.pagination.hasMore);

      // Show batch results
      if (data.successful > 0) {
        toast.success(`Batch complete: ${data.successful} cars updated successfully!`);
      }
      if (data.failed > 0) {
        toast.warning(`Batch had ${data.failed} failures`);
      }

      // Continue to next batch if there are more cars
      if (data.pagination.hasMore) {
        const nextOffset = offset + BATCH_SIZE;
        setCurrentOffset(nextOffset);
        
        // Wait 2 seconds before next batch to be gentle on APIs
        setTimeout(() => {
          processBatch(nextOffset);
        }, 2000);
      } else {
        // All done!
        setIsRunning(false);
        toast.success(`🎉 All batches complete! ${totalSuccessful + data.successful} cars updated successfully.`);
      }

    } catch (error) {
      console.error('Batch processing error:', error);
      setIsRunning(false);
      toast.error(`Batch processing failed: ${error.message}`);
    }
  };

  const stopBulkUpdate = () => {
    setIsRunning(false);
    toast.info("Bulk update stopped");
  };

  const resetSession = () => {
    setCurrentOffset(0);
    setTotalProcessed(0);
    setTotalSuccessful(0);
    setTotalFailed(0);
    setResults([]);
    setErrors([]);
    setCurrentBatch(null);
    setHasMore(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            IMAGIN.studio Bulk Image Updater
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update car images using IMAGIN.studio API. Processes 10 cars at a time.
            Only updates cars with IMAGIN-generated images - no fallbacks.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {!isRunning ? (
              <Button onClick={startBulkUpdate} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Bulk Update
              </Button>
            ) : (
              <Button onClick={stopBulkUpdate} variant="destructive" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Stop Update
              </Button>
            )}
            
            <Button onClick={resetSession} variant="outline" disabled={isRunning}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            {hasMore && !isRunning && totalProcessed > 0 && (
              <Button onClick={() => processBatch(currentOffset)} variant="secondary">
                Continue from Batch {Math.floor(currentOffset / BATCH_SIZE) + 1}
              </Button>
            )}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{totalProcessed}</div>
              <div className="text-sm text-gray-600">Processed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalSuccessful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.floor(currentOffset / BATCH_SIZE)}</div>
              <div className="text-sm text-gray-600">Batch #</div>
            </div>
          </div>

          {/* Current Batch Info */}
          {isRunning && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="font-medium">Processing Batch {Math.floor(currentOffset / BATCH_SIZE) + 1}</span>
              </div>
              <div className="text-sm text-gray-600">
                Processing cars {currentOffset + 1} to {currentOffset + BATCH_SIZE}...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Successfully Updated Cars ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.slice(-10).reverse().map((car, index) => (
                <div key={car.car_id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <div className="font-medium">{car.car_name}</div>
                    <div className="text-sm text-gray-600">
                      {car.images_count} images generated
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{car.images_count} imgs</Badge>
                    {car.primary_image && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {results.length > 10 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {results.length - 10} more successful updates
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Failed Updates ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.slice(-10).reverse().map((car, index) => (
                <div key={car.car_id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div>
                    <div className="font-medium">{car.car_name}</div>
                    <div className="text-sm text-red-600">{car.error}</div>
                  </div>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              ))}
              {errors.length > 10 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {errors.length - 10} more failures
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IMAGINBulkUpdater;