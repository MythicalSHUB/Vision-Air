import React, { useCallback, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif'];
        
        // Check if it's an image MIME type OR if it has a valid image extension
        // (handling cases where OS doesn't report MIME type correctly for HEIC/HEIF)
        if (file.type.startsWith('image/') || validExtensions.includes(extension)) {
          onImageSelected(file);
        }
      }
    },
    [onImageSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onImageSelected(e.target.files[0]);
      }
    },
    [onImageSelected]
  );

  return (
    <div
      className={`relative group w-full max-w-2xl mx-auto h-72 md:h-80 glass-panel rounded-[2rem] transition-all duration-500 ease-out flex flex-col items-center justify-center cursor-pointer overflow-hidden
        ${isDragging 
            ? 'bg-blue-500/10 dark:bg-white/10 scale-[1.01] ring-2 ring-blue-500/20 dark:ring-white/20' 
            : 'hover:bg-white/60 dark:hover:bg-white/10'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*,.heic,.heif,.avif"
        onChange={handleFileInput}
      />
      
      {/* Abstract Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="z-10 flex flex-col items-center gap-5 p-8 text-center transition-transform duration-500">
        <div className={`p-5 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md transition-all duration-500 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-blue-600 dark:text-white" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-white/70 group-hover:text-blue-600 dark:group-hover:text-white transition-colors duration-300" />
          )}
        </div>
        
        <div className="space-y-2 flex flex-col items-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
            {isDragging ? 'Drop to upload' : 'Upload Photo'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-white/50 font-light tracking-wide transition-colors duration-300">
            Supports JPG, PNG, WebP, HEIC & HEIF
          </p>
          
          <button className="mt-4 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg shadow-black/20 dark:shadow-white/10 pointer-events-none">
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;