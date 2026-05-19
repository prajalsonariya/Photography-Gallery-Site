'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ProgressiveImage({ 
  src, 
  alt, 
  fallbackUrl, 
  containerClassName = "", 
  imageClassName = "", 
  style = {},
  draggable = true,
  onError 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef(null);

  useEffect(() => {
    setIsLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div className={`relative bg-neutral-900 overflow-hidden ${containerClassName}`} style={style}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800" />
      )}
      <Image
        ref={imgRef}
        src={currentSrc}
        alt={alt || ''}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          if (fallbackUrl && currentSrc !== fallbackUrl) {
            setIsLoaded(false);
            setCurrentSrc(fallbackUrl);
          }
          if (onError) onError(e);
        }}
        draggable={draggable}
        className={`transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imageClassName}`}
      />
    </div>
  );
}
