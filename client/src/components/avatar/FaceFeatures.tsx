import { cn } from '@/lib/utils';

interface FaceFeaturesProps {
  faceShape: string;
  eyeShape: string;
  eyeColor: string;
  noseType: string;
  mouthStyle: string;
  skinTone: string;
  className?: string;
}

export function FaceFeatures({
  faceShape,
  eyeShape,
  eyeColor,
  noseType,
  mouthStyle,
  skinTone,
  className,
}: FaceFeaturesProps) {
  const getFacePath = () => {
    switch (faceShape) {
      case 'round':
        return 'M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10';
      case 'oval':
        return 'M50,15 C75,15 85,30 85,50 C85,70 75,85 50,85 C25,85 15,70 15,50 C15,30 25,15 50,15';
      case 'square':
        return 'M20,20 L80,20 L80,80 L20,80 Z';
      case 'heart':
        return 'M50,15 C60,5 80,5 90,15 C100,25 100,45 90,55 L50,85 L10,55 C0,45 0,25 10,15 C20,5 40,5 50,15';
      case 'diamond':
        return 'M50,10 L90,50 L50,90 L10,50 Z';
      default:
        return 'M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10';
    }
  };

  const getEyePath = () => {
    switch (eyeShape) {
      case 'normal':
        return 'M0,0 C10,0 20,10 20,20 C20,30 10,20 0,20 C-10,20 -20,30 -20,20 C-20,10 -10,0 0,0';
      case 'almond':
        return 'M0,0 C10,-5 20,5 20,20 C20,35 10,25 0,20 C-10,15 -20,25 -20,20 C-20,15 -10,-5 0,0';
      case 'round':
        return 'M0,0 C10,0 20,10 20,20 C20,30 10,30 0,20 C-10,10 -20,10 -20,20 C-20,30 -10,30 0,0';
      case 'cat':
        return 'M0,0 C10,-5 20,0 20,10 C20,20 10,25 0,20 C-10,15 -20,20 -20,10 C-20,0 -10,-5 0,0';
      default:
        return 'M0,0 C10,0 20,10 20,20 C20,30 10,20 0,20 C-10,20 -20,30 -20,20 C-20,10 -10,0 0,0';
    }
  };

  const getMouthPath = () => {
    switch (mouthStyle) {
      case 'smile':
        return 'M20,60 C40,70 60,70 80,60';
      case 'neutral':
        return 'M20,60 L80,60';
      case 'frown':
        return 'M20,60 C40,50 60,50 80,60';
      case 'smirk':
        return 'M20,60 C40,65 60,55 80,60';
      default:
        return 'M20,60 C40,70 60,70 80,60';
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Face */}
      <path
        d={getFacePath()}
        fill={skinTone}
        stroke="#000"
        strokeWidth="1"
      />

      {/* Left Eye */}
      <g transform="translate(30, 35)">
        <path
          d={getEyePath()}
          fill={eyeColor}
          stroke="#000"
          strokeWidth="1"
        />
        <circle cx="0" cy="10" r="5" fill="#000" />
      </g>

      {/* Right Eye */}
      <g transform="translate(70, 35)">
        <path
          d={getEyePath()}
          fill={eyeColor}
          stroke="#000"
          strokeWidth="1"
        />
        <circle cx="0" cy="10" r="5" fill="#000" />
      </g>

      {/* Nose */}
      <path
        d="M45,50 C50,40 55,40 60,50"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      />

      {/* Mouth */}
      <path
        d={getMouthPath()}
        fill="none"
        stroke="#FF69B4"
        strokeWidth="2"
      />

      {/* Eyebrows */}
      <path
        d="M25,30 C30,25 35,25 40,30"
        fill="none"
        stroke="#000"
        strokeWidth="1"
      />
      <path
        d="M60,30 C65,25 70,25 75,30"
        fill="none"
        stroke="#000"
        strokeWidth="1"
      />
    </svg>
  );
} 