'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUpload({
  onImageUpload,
  currentImage,
  aspectRatio = 1,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage && currentImage !== previewUrl) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    if (!ACCEPTED_TYPES.includes(file.type))
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 5MB';
    return null;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      setShowCropper(true);
      // Reset crop when new image is selected
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
        aspect: 1,
      });
      setCompletedCrop(null);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const onImageLoad = useCallback((img) => {
    imgRef.current = img;

    // Calculate the largest possible square crop
    const size = Math.min(img.width, img.height);
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;

    const newCrop = {
      unit: 'px',
      width: size,
      height: size,
      x,
      y,
      aspect: 1,
    };

    setCrop(newCrop);
    setCompletedCrop(newCrop); // Set initial completedCrop
  }, []);

  const generateCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) {
      setError('Please select a crop area first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = imgRef.current;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set a fixed size for the output (500x500 for profile pictures)
      const outputSize = 500;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Enable image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        outputSize,
        outputSize
      );

      // Convert to WebP with high quality
      const webpDataUrl = await new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          },
          'image/webp',
          0.7 // Higher quality for profile pictures
        );
      });

      await onImageUpload(webpDataUrl);
      setShowCropper(false);
      setIsUploading(false);
      setError(null);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error processing image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setShowCropper(false);
    setError(null);
    setIsUploading(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-4">
      <div
        className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
            <span className="text-sm">Upload</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
      />

      {error && <div className="text-red-500 text-sm mt-2 mb-2">{error}</div>}

      {isUploading && (
        <div className="text-blue-600 text-sm mt-2 mb-2">
          Uploading image...
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-[95vw] max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Crop Your Profile Picture
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div
              className="relative overflow-hidden"
              style={{ maxHeight: 'calc(80vh - 200px)' }}
            >
              <div className="relative w-full" style={{ maxHeight: '100%' }}>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="Crop preview"
                    onLoad={(e) => onImageLoad(e.currentTarget)}
                    className="max-w-full"
                    style={{ maxHeight: 'calc(80vh - 200px)' }}
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={generateCroppedImage}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  isUploading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isUploading}
              >
                {isUploading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
