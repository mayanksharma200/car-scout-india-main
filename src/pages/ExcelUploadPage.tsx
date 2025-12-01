import React from 'react';
import ExcelCarUpload from '@/components/ExcelCarUpload';

const ExcelUploadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Excel Car Data Upload</h1>
        <p className="text-center text-gray-600 mb-8">
          Upload comprehensive car data from Excel files with detailed specifications
        </p>
        <ExcelCarUpload />
      </div>
    </div>
  );
};

export default ExcelUploadPage;