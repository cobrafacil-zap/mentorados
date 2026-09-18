"use client";

import { supabaseToR2 } from "@/lib/storage-url";

interface StorageImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

/**
 * <img> que converte automaticamente URLs do Supabase Storage pra R2.
 * Resolve o problema de Cached Egress do Supabase Free Plan.
 */
export function StorageImage({
  src,
  alt,
  className,
  style,
  width,
  height,
}: StorageImageProps) {
  const finalSrc = supabaseToR2(src);

  if (!finalSrc) return null;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
}