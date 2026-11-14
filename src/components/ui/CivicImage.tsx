import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface CivicImageProps extends Omit<ImageProps, "alt"> {
  /**
   * Descriptive alternative text required for WCAG AA compliance.
   */
  alt: string;
  /**
   * Optional aspect ratio wrapper (e.g. "16/9", "4/3", "1/1") to enforce zero Cumulative Layout Shift (CLS).
   */
  aspectRatio?: string;
  /**
   * Optional custom container styling
   */
  containerClassName?: string;
  /**
   * Priority loading for above-the-fold LCP image elements.
   */
  priority?: boolean;
}

/**
 * Core Web Vitals Optimized Image Component.
 * - Enforces explicit dimensions or aspect ratios to eliminate CLS (Cumulative Layout Shift < 0.1).
 * - Defaults to lazy loading with decoding="async" for below-the-fold images.
 * - Supports priority preloading for above-the-fold LCP elements.
 * - Utilizes Next.js automatic WebP/AVIF modern image optimization.
 */
export function CivicImage({
  alt,
  src,
  width,
  height,
  priority = false,
  aspectRatio,
  containerClassName,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  ...rest
}: CivicImageProps) {
  const isFill = !width && !height;

  if (aspectRatio || isFill) {
    return (
      <div
        className={cn("bg-surface-alt relative overflow-hidden", containerClassName)}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill={isFill}
          priority={priority}
          sizes={sizes}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          className={cn("object-cover transition-opacity duration-200", className)}
          {...rest}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      loading={priority ? undefined : "lazy"}
      decoding="async"
      className={cn("bg-surface-alt h-auto max-w-full transition-opacity duration-200", className)}
      {...rest}
    />
  );
}
