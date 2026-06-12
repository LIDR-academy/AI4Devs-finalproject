import React from 'react';

type ImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

const NextImage = ({ src, alt, className, width, height }: ImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} width={width} height={height} />
);

export default NextImage;
