import { useState } from 'react';

type PostingThumbnailProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function PostingThumbnail({ src, alt, className = 'h-full w-full' }: PostingThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <PostingThumbnailFallback className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-cover`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

function PostingThumbnailFallback({ className }: { className: string }) {
  return (
    <div
      className={`${className} flex items-center justify-center bg-[#E6EEF8] text-[13px] font-bold text-[#9AA6B2]`}
      aria-label="공고 기본 이미지"
    >
      FitMe
    </div>
  );
}
