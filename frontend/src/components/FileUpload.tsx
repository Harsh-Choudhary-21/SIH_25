import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

interface FileUploadProps {
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      setUploadMessage('Please upload only PDF or image files (JPG, PNG)');
      onUploadError?.('Invalid file type');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('error');
      setUploadMessage('File size must be less than 10MB');
      onUploadError?.('File too large');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const response = await api.uploadFile(file);
      setIsUploading(false);
      setUploadStatus('success');
      setUploadMessage(`File "${file.name}" uploaded successfully!`);
      onUploadSuccess?.(response);
    } catch (error) {
      setIsUploading(false);
      setUploadStatus('error');
      setUploadMessage('Upload failed. Please try again.');
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Uploading...</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium text-green-700 mb-2">Upload Successful!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{uploadMessage}</p>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-600 mb-4" />
            <p className="text-lg font-medium text-red-700 mb-2">Upload Failed</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{uploadMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drag & drop your files here
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              or click to browse files
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <File className="h-4 w-4" />
              <span>Supports: PDF, JPG, PNG (max 10MB)</span>
            </div>
          </div>
        )}
      </div>
      
      {uploadMessage && (
        <div className={`mt-4 p-4 rounded-md ${
          uploadStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {uploadMessage}
        </div>
      )}
    </div>
  );
};

export default FileUpload;