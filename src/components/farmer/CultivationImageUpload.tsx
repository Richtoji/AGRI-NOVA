"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Camera, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface CultivationImageUploadProps {
  label: string;
  subLabel?: string;
  submitButtonText: string;
  onSubmit: (imageUrl: string, notes: string) => Promise<void>;
  isLoading?: boolean;
}

export function CultivationImageUpload({
  label,
  subLabel = "Upload a photograph after completing this cultivation step.",
  submitButtonText = "SUBMIT FOR ADMIN APPROVAL",
  onSubmit,
  isLoading = false
}: CultivationImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ size: string; type: string; dimensions?: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

  const validateAndProcessFile = (file: File) => {
    setValidationError(null);

    // 1. File existence
    if (!file) {
      setValidationError("Please select an image file.");
      return;
    }

    // 2. MIME type check
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setValidationError("Please upload a JPG, JPEG, PNG, or WEBP image.");
      return;
    }

    // 3. Extension check
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTS.some(ext => lowerName.endsWith(ext));
    if (!hasValidExt) {
      setValidationError("Invalid file extension. Please upload a .jpg, .jpeg, .png, or .webp image.");
      return;
    }

    // 4. File size check (5 MB)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setValidationError("Image size exceeds the maximum allowed limit of 5 MB.");
      return;
    }

    // 5. Image readability & dimension validation via browser Image constructor
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Minimum dimension validation (200x200 px)
      if (img.naturalWidth < 200 || img.naturalHeight < 200) {
        setValidationError("Image resolution is too low. Please upload a clearer photograph.");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Validated successfully
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setFileMeta({
        size: sizeStr,
        type: file.type.replace("image/", "").toUpperCase(),
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`
      });
    };

    img.onerror = () => {
      setValidationError("The selected file could not be read as a valid image.");
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileMeta(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setValidationError("Please upload a crop photograph before submitting.");
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      // 1. Upload file to strict backend upload endpoint
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/crops/cultivate/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image. Please try again.");
      }

      // 2. Call parent onSubmit with the uploaded image URL & farmer notes
      await onSubmit(data.url, notes);

      // Clean up after successful submit
      handleRemove();
      setNotes("");
    } catch (err: any) {
      setValidationError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <Camera className="w-5 h-5 text-green-600" />
        <div>
          <h4 className="font-bold text-sm text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500">{subLabel}</p>
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <p className="font-medium">{validationError}</p>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-gray-800">
            Click to upload or drag & drop photograph
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Accepted: JPG, JPEG, PNG, WEBP (Maximum 5 MB, Min 200×200px)
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in">
          {/* Photo Preview Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-gray-300 relative group">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Cultivation preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 w-full space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-block mb-1">
                    ✓ Valid Image Selected
                  </span>
                  <p className="font-bold text-gray-900 truncate max-w-[240px]">
                    {selectedFile.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 text-[11px] font-medium text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Size</span>
                  <span>{fileMeta?.size}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Format</span>
                  <span>{fileMeta?.type}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Resolution</span>
                  <span>{fileMeta?.dimensions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Farmer Observations & Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sowed seeds in moist prepared pits, added initial organic compost."
              rows={2}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 bg-white placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading || isLoading}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || isLoading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-700 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isUploading || isLoading ? (
                <span>Validating & Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitButtonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
