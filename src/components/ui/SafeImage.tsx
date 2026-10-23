import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeImage({ src, alt, className, fallbackSrc, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setAttemptedFallback(false);
  }, [src]);

  const handleError = () => {
    if (!attemptedFallback && typeof currentSrc === 'string' && currentSrc) {
      setAttemptedFallback(true);
      // Auto-fallback between /api/uploads/ and /uploads/
      if (currentSrc.startsWith('/api/uploads/')) {
        setCurrentSrc(currentSrc.replace('/api/uploads/', '/uploads/'));
        return;
      }
      if (currentSrc.startsWith('/uploads/')) {
        setCurrentSrc(currentSrc.replace('/uploads/', '/api/uploads/'));
        return;
      }
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        return;
      }
    }
    setHasError(true);
  };

  if (hasError || !currentSrc) {
    if (fallbackSrc && !attemptedFallback) {
      return <img src={fallbackSrc} alt={alt || "Placeholder"} className={className} {...props} />;
    }
    
    // Default neutral placeholder if no fallback is provided
    return (
      <div className={`flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100/80 ${className}`} {...(props as any)}>
        <Leaf className="w-1/2 h-1/2 opacity-75" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || "Image"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
