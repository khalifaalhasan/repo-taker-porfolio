"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import getCroppedImg from "@/lib/cropImage";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 16 / 9 }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  type Area = { x: number; y: number; width: number; height: number };

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels as any);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
        />
      </div>
      <div className="p-6 bg-card border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full max-w-sm flex items-center gap-4">
          <span className="text-sm font-medium">Zoom</span>
          <Slider 
            value={[zoom]} 
            min={1} 
            max={3} 
            step={0.1} 
            onValueChange={(val) => setZoom(typeof val === 'number' ? val : val[0])} 
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">Cancel</Button>
          <Button onClick={handleSave} disabled={isProcessing} className="flex-1 sm:flex-none">
            {isProcessing ? "Processing..." : "Apply Crop"}
          </Button>
        </div>
      </div>
    </div>
  );
}
