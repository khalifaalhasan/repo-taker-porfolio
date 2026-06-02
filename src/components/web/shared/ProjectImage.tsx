"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface ProjectImageProps {
  src: string;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function ProjectImage({ src, alt, containerClassName = "", imageClassName = "", priority = false }: ProjectImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      className={`relative w-full overflow-hidden bg-secondary/30 aspect-[1200/630] ${containerClassName}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        priority={priority}
        unoptimized={true}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'} ${imageClassName}`}
      />
    </div>
  );
}
