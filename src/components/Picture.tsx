import React, { useState } from 'react';
import type { ResponsiveImage } from '../config/content';

interface PictureProps {
  img: ResponsiveImage;
  sizes: string;
  /** Imagem da primeira dobra: carrega com prioridade e sem lazy loading. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * <picture> com AVIF (menor) e WebP de reserva, sempre com largura e altura (evita CLS).
 * Se o arquivo escolhido falhar ao carregar, tenta de novo só com o WebP, que todo
 * navegador atual abre. O erro continua visível no console e na aba de rede.
 */
export function Picture({ img, sizes, priority = false, className, imgClassName }: PictureProps) {
  const [webpOnly, setWebpOnly] = useState(false);

  const common = {
    alt: img.alt,
    width: img.width,
    height: img.height,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : undefined,
    decoding: 'async' as const,
    className: imgClassName,
  };

  if (webpOnly) {
    return (
      <picture className={className}>
        <img {...common} src={img.src} srcSet={img.srcSetWebp} sizes={sizes} />
      </picture>
    );
  }

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={img.srcSetAvif} sizes={sizes} />
      <source type="image/webp" srcSet={img.srcSetWebp} sizes={sizes} />
      <img {...common} src={img.src} onError={() => setWebpOnly(true)} />
    </picture>
  );
}
