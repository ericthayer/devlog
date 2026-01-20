
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { Asset } from '../types';

interface LazyArtifactProps {
  artifact: Asset;
}

export const LazyArtifact: React.FC<LazyArtifactProps> = ({ artifact }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isImage = artifact.url && artifact.fileType.match(/(jpg|jpeg|png|webp|gif)/i);
  const isVideo = artifact.url && artifact.fileType.match(/(mp4|webm|mov)/i);

  useEffect(() => {
    if (!isVideo || !videoRef.current || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (videoRef.current) {
              videoRef.current.preload = "auto";
              videoRef.current.play().catch(() => {});
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVideo]);

  return (
    <div 
      ref={containerRef}
      className="aspect-video bg-zinc-100 flex items-center justify-center relative border-b-4 border-black overflow-hidden group/media"
    >
      {!isLoaded && (artifact.url) && (
        <div className="absolute inset-0 bg-zinc-200 animate-pulse z-10 flex items-center justify-center">
          <Icon name="Loader2" size={24} className="animate-spin text-black/20" />
        </div>
      )}

      {isImage ? (
        <img 
          src={artifact.url} 
          alt={artifact.aiName} 
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      ) : isVideo ? (
        <video 
          ref={videoRef}
          src={artifact.url} 
          muted 
          loop 
          playsInline
          preload="none"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      ) : (
        <div className="p-8 text-center flex flex-col items-center gap-3">
          <Icon name="FileCode" size={48} className="opacity-10 group-hover:opacity-30 transition-opacity" />
          <span className="mono text-[8px] font-black uppercase opacity-20">No_Preview_Avail</span>
        </div>
      )}

      <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[8px] font-bold uppercase mono z-10">
        {artifact.fileType}
      </div>
    </div>
  );
};