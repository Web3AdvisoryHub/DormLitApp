import { cn } from '@/lib/utils';

interface AvatarPreviewProps {
  data: {
    faceShape: string;
    hairStyle: string;
    hairColor: string;
    eyeShape: string;
    eyeColor: string;
    noseType: string;
    mouthStyle: string;
    skinTone: string;
    clothing: string;
    accessories: string[];
  };
  className?: string;
}

export function AvatarPreview({ data, className }: AvatarPreviewProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Face */}
      <div
        className="absolute w-full h-full rounded-full"
        style={{ backgroundColor: data.skinTone }}
      >
        {/* Eyes */}
        <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4">
          <div
            className={cn(
              "w-full h-full rounded-full",
              data.eyeShape === 'normal' ? 'rounded-full' : 'rounded-none'
            )}
            style={{ backgroundColor: data.eyeColor }}
          />
        </div>
        <div className="absolute top-1/4 right-1/4 w-1/4 h-1/4">
          <div
            className={cn(
              "w-full h-full rounded-full",
              data.eyeShape === 'normal' ? 'rounded-full' : 'rounded-none'
            )}
            style={{ backgroundColor: data.eyeColor }}
          />
        </div>

        {/* Nose */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "w-1/8 h-1/8",
            data.noseType === 'normal' ? 'rounded-full' : 'rounded-none'
          )}
          style={{ backgroundColor: '#8B4513' }}
        />

        {/* Mouth */}
        <div
          className={cn(
            "absolute bottom-1/4 left-1/4 w-1/2 h-1/8",
            data.mouthStyle === 'smile' ? 'rounded-b-full' : 'rounded-none'
          )}
          style={{ backgroundColor: '#FF69B4' }}
        />
      </div>

      {/* Hair */}
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-full",
          data.hairStyle === 'short' ? 'h-1/4' :
          data.hairStyle === 'medium' ? 'h-1/2' :
          'h-3/4'
        )}
        style={{ backgroundColor: data.hairColor }}
      />

      {/* Accessories */}
      {data.accessories.includes('glasses') && (
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/8 bg-gray-300 rounded-full" />
      )}
      {data.accessories.includes('hat') && (
        <div className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-gray-500 rounded-t-full" />
      )}
      {data.accessories.includes('earrings') && (
        <>
          <div className="absolute top-1/3 left-1/8 w-1/8 h-1/8 bg-yellow-500 rounded-full" />
          <div className="absolute top-1/3 right-1/8 w-1/8 h-1/8 bg-yellow-500 rounded-full" />
        </>
      )}
      {data.accessories.includes('necklace') && (
        <div className="absolute bottom-1/4 left-1/4 w-1/2 h-1/8 bg-gray-300 rounded-full" />
      )}
    </div>
  );
} 