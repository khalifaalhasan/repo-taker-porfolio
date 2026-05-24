"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProjectImageProps {
  src: string;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
}

export function ProjectImage({ src, alt, containerClassName = "", imageClassName = "" }: ProjectImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      className={`relative w-full overflow-hidden bg-secondary/30 ${
        // On mobile: fixed 16:9 ratio. On desktop: auto height (min height while loading)
        "aspect-video md:aspect-auto md:min-h-[250px]"
      } ${containerClassName}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        className={`w-full transition-all duration-700 ${
          // On mobile: object-cover (fills the 16:9 container, might crop). 
          // On desktop: h-auto (preserves original aspect ratio perfectly, no crop).
          "h-full object-cover md:h-auto"
        } ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'} ${imageClassName}`}
      />
    </div>
  );
}
