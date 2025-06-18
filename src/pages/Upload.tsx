import React, { useState, useCallback } from 'react';
import { 
  Upload as UploadIcon, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Download,
  Eye,
  Trash2,
  Clock,
  BarChart3
} from 'lucide-react';
import { ThreatData } from '../types';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  recordsCount?: number;
  threatsDetected?: number;
  errorMessage?: string;
}

export const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [previewData, setPreviewData] = useState<ThreatData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        // Show error for invalid file type
        const errorFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          status: 'error',
          errorMessage: 'Invalid file type. Please upload CSV files only.'
        };
        setUploadedFiles(prev => [errorFile, ...prev]);
      }
    });
  };

  const processFile = (file: File) => {
    const fileId = Date.now().toString();
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing'
    };

    setUploadedFiles(prev => [newFile, ...prev]);

    // Simulate file processing
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const records = lines.length - 1; // Subtract header row
        
        // Simulate threat detection (random for demo)
        const threatsDetected = Math.floor(Math.random() * records * 0.3);
        
        setTimeout(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', recordsCount: records, threatsDetected }
              : f
          ));
          
          // Generate preview data
          generatePreviewData(text, fileId);
        }, 2000 + Math.random() * 3000); // 2-5 seconds processing time
        
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', errorMessage: 'Failed to process CSV file' }
            : f
        ));
      }
    };
    
    reader.readAsText(file);
  };

  const generatePreviewData = (csvText: string, fileId: string) => {
    // Parse CSV and generate mock threat data
    const lines = csvText.split('\n').filter(line => line.trim());
    const mockThreats: ThreatData[] = Array.from({ length: Math.min(10, lines.length - 1) }, (_, i) => ({
      id: `${fileId}-threat-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      destinationIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      port: Math.floor(Math.random() * 65535) + 1,
      protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
      threatType: ['Malware', 'DDoS', 'Intrusion', 'Phishing', 'Botnet'][Math.floor(Math.random() * 5)],
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      confidence: Math.floor(Math.random() * 40) + 60,
      details: 'Threat detected from uploaded log analysis',
      blocked: Math.random() > 0.4,
    }));
    
    setPreviewData(mockThreats);
  };

  const deleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const previewFile = (file: UploadedFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'completed':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Log Upload & Analysis</h1>
          <p className="text-gray-400 mt-1">Upload CSV log files for automated threat analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Supported formats</p>
            <p className="text-white font-medium">CSV files only</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-cyan-400 bg-cyan-500/10' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-cyan-500/20 rounded-full">
                <UploadIcon className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Drop your CSV files here or click to browse
              </h3>
              <p className="text-gray-400 mb-4">
                Maximum file size: 100MB • Supported format: CSV
              </p>
              <input
                type="file"
                multiple
                accept=".csv"
                onChange={handleChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200"
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose Files
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress & Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Uploaded Files</h3>
            <span className="text-sm text-gray-400">{uploadedFiles.length} files</span>
          </div>
          
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className={`border rounded-lg p-4 ${getStatusColor(file.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm text-gray-300 capitalize">{file.status}</span>
                    </div>
                    
                    {file.status === 'completed' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => previewFile(file)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                          title="Preview results"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                          title="Download report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {file.status === 'completed' && (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        {file.recordsCount?.toLocaleString()} records processed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-300">
                        {file.threatsDetected?.toLocaleString()} threats detected
                      </span>
                    </div>
                  </div>
                )}
                
                {file.status === 'error' && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{file.errorMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-6xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                <p className="text-gray-400 text-sm">Analysis Results Preview</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold text-white">{selectedFile.recordsCount?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Threats Detected</p>
                  <p className="text-2xl font-bold text-red-400">{selectedFile.threatsDetected?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Risk Level</p>
                  <p className="text-2xl font-bold text-yellow-400">Medium</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-300">Source IP</th>
                      <th className="px-4 py-2 text-left text-gray-300">Threat Type</th>
                      <th className="px-4 py-2 text-left text-gray-300">Severity</th>
                      <th className="px-4 py-2 text-left text-gray-300">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {previewData.slice(0, 10).map((threat) => (
                      <tr key={threat.id}>
                        <td className="px-4 py-2 text-white font-mono">{threat.sourceIp}</td>
                        <td className="px-4 py-2 text-gray-300">{threat.threatType}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            threat.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            threat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {threat.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-300">{threat.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};