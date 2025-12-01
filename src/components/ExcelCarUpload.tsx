import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Database, Download } from 'lucide-react';

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    totalRows: number;
    validCars: number;
    invalidCars: number;
    duplicateCars: number;
    insertResult?: {
      successful: number;
      failed: number;
      errors: Array<{
        batch: number;
        error: string;
        affectedRows: number;
      }>;
      insertedIds: string[];
    };
  };
  validationResults?: {
    valid: any[];
    invalid: Array<{
      index: number;
      errors: string[];
      data: any;
    }>;
    duplicates: Array<{
      index: number;
      car: string;
      data: any;
    }>;
  };
  error?: string;
  code?: string;
}

interface UploadStatus {
  totalCars: number;
  brandCounts: Record<string, number>;
  recentUploads: Array<{
    brand: string;
    model: string;
    created_at: string;
  }>;
  lastUpdated: string;
}

const ExcelCarUpload: React.FC = () => {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  // Fetch upload status on component mount
  React.useEffect(() => {
    fetchUploadStatus();
  }, []);

  const fetchUploadStatus = async () => {
    try {
      const response = await fetch('/api/admin/upload-status');
      const result = await response.json();
      
      if (result.success) {
        setUploadStatus(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch upload status:', err);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      // Create progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result: UploadResult = await response.json();
      setUploadResult(result);

      if (result.success) {
        // Refresh upload status after successful upload
        setTimeout(fetchUploadStatus, 1000);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleForceInsert = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch('/api/admin/force-insert', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResult = await response.json();
      setUploadResult(result);

      if (result.success) {
        setTimeout(fetchUploadStatus, 1000);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to force insert');
      console.error('Force insert error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAllCars = async () => {
    if (!window.confirm('Are you sure you want to delete ALL car data? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/clear-all-cars', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('All car data cleared successfully');
        fetchUploadStatus();
        setUploadResult(null);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to clear car data');
      console.error('Clear error:', err);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/template');
      const result = await response.json();

      if (result.success) {
        // Create CSV content
        const headers = result.data.headers.join(',');
        const sampleRow = Object.values(result.data.sampleData[0]).map(value => 
          typeof value === 'string' ? `"${value}"` : value
        ).join(',');
        
        const csvContent = `${headers}\n${sampleRow}`;
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'car_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to download template');
      console.error('Template download error:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Excel Car Data Upload</h1>
        <p className="text-gray-600">Upload comprehensive car data from Excel files with detailed specifications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Excel</TabsTrigger>
          <TabsTrigger value="status">Database Status</TabsTrigger>
          <TabsTrigger value="template">Download Template</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Excel File
              </CardTitle>
              <CardDescription>
                Drag and drop your Excel file here, or click to browse. Supports .xlsx and .xls files up to 50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop your Excel file here' : 'Drag & drop Excel file here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <Button variant="outline" disabled={isUploading}>
                  Browse Files
                </Button>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="mt-4" variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Upload Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadResult.success ? (
                  <div>
                    <Alert className="mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        {uploadResult.message}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {uploadResult.data?.totalRows || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Rows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {uploadResult.data?.validCars || 0}
                        </div>
                        <div className="text-sm text-gray-500">Valid Cars</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {uploadResult.data?.invalidCars || 0}
                        </div>
                        <div className="text-sm text-gray-500">Invalid Cars</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {uploadResult.data?.duplicateCars || 0}
                        </div>
                        <div className="text-sm text-gray-500">Duplicates</div>
                      </div>
                    </div>

                    {uploadResult.data?.insertResult && (
                      <div>
                        <h4 className="font-semibold mb-2">Database Insert Results:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Successful: {uploadResult.data.insertResult.successful}
                            </Badge>
                          </div>
                          <div>
                            <Badge variant="default" className="bg-red-100 text-red-800">
                              Failed: {uploadResult.data.insertResult.failed}
                            </Badge>
                          </div>
                        </div>

                        {uploadResult.data.insertResult.errors.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                            <div className="max-h-40 overflow-y-auto bg-red-50 p-3 rounded text-sm">
                              {uploadResult.data.insertResult.errors.map((error, index) => (
                                <div key={index} className="mb-2">
                                  <strong>Batch {error.batch}:</strong> {error.error}
                                  <div className="text-gray-600">Affected rows: {error.affectedRows}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {uploadResult.error || uploadResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Validation Errors */}
                {uploadResult.validationResults && (
                  <div>
                    {uploadResult.validationResults.invalid.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-red-600 mb-2">Validation Errors:</h5>
                        <div className="max-h-60 overflow-y-auto bg-red-50 p-3 rounded text-sm">
                          {uploadResult.validationResults.invalid.map((item, index) => (
                            <div key={index} className="mb-3 border-b border-red-200 pb-2">
                              <div className="font-medium">Row {item.index}:</div>
                              <ul className="list-disc list-inside text-red-700">
                                {item.errors.map((error, errIndex) => (
                                  <li key={errIndex}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResult.validationResults.duplicates.length > 0 && (
                      <div>
                        <h5 className="font-medium text-orange-600 mb-2">Duplicate Cars:</h5>
                        <div className="max-h-40 overflow-y-auto bg-orange-50 p-3 rounded text-sm">
                          {uploadResult.validationResults.duplicates.map((item, index) => (
                            <div key={index} className="mb-2">
                              <strong>Row {item.index}:</strong> {item.car}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Force Insert Option */}
                    {(uploadResult.validationResults.invalid.length > 0 || uploadResult.validationResults.duplicates.length > 0) && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded">
                        <h5 className="font-medium text-yellow-800 mb-2">Force Insert Option:</h5>
                        <p className="text-sm text-yellow-700 mb-3">
                          You can choose to force insert the valid cars, ignoring validation errors and duplicates.
                        </p>
                        <Button 
                          onClick={() => {
                            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                            if (fileInput && fileInput.files && fileInput.files[0]) {
                              handleForceInsert(fileInput.files[0]);
                            }
                          }}
                          variant="outline"
                          disabled={isUploading}
                        >
                          Force Insert Valid Cars Only
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {uploadStatus ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadStatus.totalCars.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Cars</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(uploadStatus.brandCounts).length}
                    </div>
                    <div className="text-sm text-gray-600">Car Brands</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {uploadStatus.recentUploads.length}
                    </div>
                    <div className="text-sm text-gray-600">Recent Uploads</div>
                  </div>
                </div>

                {/* Brand Counts */}
                <div>
                  <h4 className="font-semibold mb-3">Cars by Brand:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(uploadStatus.brandCounts).map(([brand, count]) => (
                      <div key={brand} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{brand}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Uploads */}
                <div>
                  <h4 className="font-semibold mb-3">Recent Uploads (Last 24 hours):</h4>
                  {uploadStatus.recentUploads.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadStatus.recentUploads.map((upload, index) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{upload.brand} {upload.model}</span>
                            <div className="text-sm text-gray-500">
                              {new Date(upload.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent uploads</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={fetchUploadStatus} variant="outline">
                    Refresh Status
                  </Button>
                  <Button 
                    onClick={handleClearAllCars} 
                    variant="destructive"
                  >
                    Clear All Cars
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Loading database status...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Excel Template
              </CardTitle>
              <CardDescription>
                Download a pre-formatted Excel template with all required columns for car data upload.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Use this template to ensure your Excel file has the correct format and column headers.
                The template includes sample data to help you understand the expected format.
              </p>
              <Button onClick={downloadTemplate} size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Excel Template
              </Button>
              
              <div className="mt-6 text-left">
                <h4 className="font-semibold mb-2">Template includes:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Basic car information (Make, Model, Version, etc.)</li>
                  <li>Technical specifications (Engine, Transmission, Dimensions, etc.)</li>
                  <li>Safety features and equipment</li>
                  <li>Comfort and convenience features</li>
                  <li>Pricing and warranty information</li>
                  <li>Colors and images</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExcelCarUpload;