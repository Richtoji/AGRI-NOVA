import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeImage({ src, alt, className, fallbackSrc, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    if (fallbackSrc) {
      return <img src={fallbackSrc} alt={alt || "Placeholder"} className={className} {...props} />;
    }
    
    // Default neutral placeholder if no fallback is provided
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 border border-gray-200 ${className}`} {...(props as any)}>
        <ImageIcon className="w-1/3 h-1/3 opacity-20" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Image"}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
