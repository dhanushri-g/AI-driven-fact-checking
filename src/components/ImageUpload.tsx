import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';

interface ImageUploadProps {
  onAnalyze: (imageBase64: string) => void;
  loading: boolean;
}

export default function ImageUpload({ onAnalyze, loading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onAnalyze(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <ImageIcon className="w-5 h-5 text-blue-400" />
        <span>Analyze Image (Beta)</span>
      </h3>

      {!preview ? (
        <label
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={loading}
          />
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-300 font-medium mb-1">
            Drop image here or click to select
          </p>
          <p className="text-xs text-gray-500">
            Upload an image to analyze for AI generation or deepfake indicators
          </p>
        </label>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-300">Image Preview</h4>
            <button
              onClick={() => setPreview(null)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto max-h-64 object-contain rounded-lg mb-4"
          />
          {loading && (
            <div className="flex items-center justify-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-sm">Analyzing image...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
