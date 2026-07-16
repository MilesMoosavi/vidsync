"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export default function FallbackImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-500 rounded ${
          fallbackClassName || className || ""
        }`}
      >
        <ImageOff size={24} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "image"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
