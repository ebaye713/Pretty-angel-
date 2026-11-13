import {useState} from 'react';
import {Sparkles} from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F9E3E8] via-[#FDF6F7] to-[#F2D5CB] p-6 text-center ${className}`}
      >
        <Sparkles className="mb-3 h-7 w-7 text-[#B87463]" aria-hidden="true" />
        <p className="font-serif text-lg font-medium text-[#2E1620]">
          {fallbackTitle ?? "PrettyAngel's Boutique"}
        </p>
        <p className="mt-1 text-xs text-[#664954]">Vicarage Field · Barking</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
