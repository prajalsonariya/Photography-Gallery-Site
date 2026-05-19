'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera as CameraIcon, Calendar, Aperture, Clock, Settings2, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { setShowOriginal(false); onNext(); }
      if (e.key === 'ArrowLeft') { setShowOriginal(false); onPrev(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) { setShowOriginal(false); onNext(); }
    if (isRightSwipe) { setShowOriginal(false); onPrev(); }
  };

  const image = images[currentIndex];
  if (!image) return null;

  const previewUrl = image.baseCdnUrl ? `/api/thumbnail?url=${encodeURIComponent(`${image.baseCdnUrl}=s2000-rw`)}` : image.url;
  const currentImageUrl = showOriginal ? image.url : previewUrl;

  const meta = image.imageMediaMetadata || {};
  const dateStr = meta.time ? new Date(meta.time).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const formatExposure = (exposureTime) => {
    if (!exposureTime) return '';
    if (exposureTime >= 1) return `${exposureTime}s`;
    return `1/${Math.round(1 / exposureTime)}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed inset-0 z-[100] bg-neutral-950/95 backdrop-blur-xl flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-white/50 hover:text-white transition-all duration-150 bg-white/5 hover:bg-white/10 rounded-full p-3 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        <button 
          onClick={() => { setShowOriginal(false); onPrev(); }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 text-white/30 hover:text-white transition-all duration-150 p-4 hidden sm:block"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button 
          onClick={() => { setShowOriginal(false); onNext(); }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 text-white/30 hover:text-white transition-all duration-150 p-4 hidden sm:block"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 h-full max-h-[100dvh]">
          <motion.div 
            key={image.id}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full flex-1 flex items-center justify-center min-h-0 mb-6"
          >
            {image.type === 'video' ? (
              <video 
                src={image.url} 
                controls
                autoPlay
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
              />
            ) : (
              <img 
                key={currentImageUrl}
                src={currentImageUrl} 
                alt={image.description || image.name} 
                className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
                style={{ transform: 'translate3d(0,0,0)' }}
                draggable={false}
              />
            )}
          </motion.div>

          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.15, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-6 shrink-0 w-full sm:w-auto px-4 z-10"
          >
            <a 
              href={`${image.url}&download=true`}
              download={image.name}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/90 hover:bg-white text-black text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-sm sm:min-w-[180px]"
            >
              <Download className="w-4 h-4" />
              Download Image
            </a>

            {!showOriginal && image.type !== 'video' && (
              <button 
                onClick={() => setShowOriginal(true)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-white/20 text-white/90 hover:text-white hover:bg-white/10 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium transition-colors rounded-sm sm:min-w-[180px]"
              >
                <Eye className="w-4 h-4" />
                View Original
              </button>
            )}
            
            {image.rawFileId && (
              <a 
                href={`/api/image/${image.rawFileId}?download=true&filename=${encodeURIComponent(image.rawFileName || 'RAW_file')}`}
                download={image.rawFileName || `RAW_${image.name}`}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-white/10 text-white/70 hover:text-white text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white/5 transition-colors rounded-sm sm:min-w-[180px]"
              >
                <Download className="w-3 h-3" />
                Download RAW
              </a>
            )}
          </motion.div>

          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.15, ease: "easeOut" }}
            className="w-full shrink-0 border-t border-white/5 pt-4 pb-2 px-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-500 z-10"
          >
            {image.description && (
              <div className="w-full text-center text-neutral-400 mb-1 tracking-[0.1em] font-light">
                {image.description}
              </div>
            )}
            
            {dateStr && <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 opacity-50" /> {dateStr}</span>}
            {meta.cameraMake && <span className="flex items-center gap-1.5"><CameraIcon className="w-3 h-3 opacity-50" /> {meta.cameraMake} {meta.cameraModel}</span>}
            {meta.focalLength && <span className="flex items-center gap-1.5"><Settings2 className="w-3 h-3 opacity-50" /> {meta.focalLength}mm</span>}
            {meta.aperture && <span className="flex items-center gap-1.5"><Aperture className="w-3 h-3 opacity-50" /> f/{meta.aperture}</span>}
            {meta.exposureTime && <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 opacity-50" /> {formatExposure(meta.exposureTime)}</span>}
            {meta.isoSpeed && <span className="flex items-center gap-1.5">ISO {meta.isoSpeed}</span>}
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
