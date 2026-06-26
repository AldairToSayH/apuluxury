import Image from "next/image";

import { imageAssets } from "@/lib/imageAssets";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductImage({
  src,
  alt,
  className,
  fallbackSrc = imageAssets.productPlaceholder,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: ProductImageProps) {
  if (src) {
    return <img alt={alt} className={className} src={src} />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={1000}
      priority={priority}
      sizes={sizes}
      src={fallbackSrc}
      width={800}
    />
  );
}
