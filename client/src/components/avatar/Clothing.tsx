import { cn } from '@/lib/utils';

interface ClothingProps {
  clothingStyle: string;
  clothingColor: string;
  accessories?: string[];
  className?: string;
}

export function Clothing({ clothingStyle, clothingColor, accessories = [], className }: ClothingProps) {
  const getClothingPath = () => {
    switch (clothingStyle) {
      case 't-shirt':
        return 'M20,50 C20,45 30,40 50,40 C70,40 80,45 80,50 C80,70 70,80 50,80 C30,80 20,70 20,50';
      case 'hoodie':
        return 'M20,50 C20,45 30,40 50,40 C70,40 80,45 80,50 C80,70 70,80 50,80 C30,80 20,70 20,50 M20,50 C20,60 30,65 50,65 C70,65 80,60 80,50 M50,40 C50,30 60,25 70,30 C75,35 75,45 70,50';
      case 'dress':
        return 'M20,50 C20,45 30,40 50,40 C70,40 80,45 80,50 C80,70 70,90 50,90 C30,90 20,70 20,50';
      case 'suit':
        return 'M20,50 C20,45 30,40 50,40 C70,40 80,45 80,50 C80,70 70,80 50,80 C30,80 20,70 20,50 M30,40 L30,60 M70,40 L70,60';
      default:
        return 'M20,50 C20,45 30,40 50,40 C70,40 80,45 80,50 C80,70 70,80 50,80 C30,80 20,70 20,50';
    }
  };

  const getAccessoryPath = (accessory: string) => {
    switch (accessory) {
      case 'glasses':
        return 'M30,40 C35,35 45,35 50,40 C55,45 55,55 50,60 C45,65 35,65 30,60 C25,55 25,45 30,40 M60,40 C65,35 75,35 80,40 C85,45 85,55 80,60 C75,65 65,65 60,60 C55,55 55,45 60,40 M50,50 L60,50';
      case 'hat':
        return 'M20,20 C30,10 70,10 80,20 C85,30 85,40 80,50 C75,60 25,60 20,50 C15,40 15,30 20,20';
      case 'scarf':
        return 'M30,50 C35,45 45,45 50,50 C55,55 55,65 50,70 C45,75 35,75 30,70 C25,65 25,55 30,50';
      case 'necklace':
        return 'M30,50 C35,45 45,45 50,50 C55,55 55,65 50,70 C45,75 35,75 30,70 C25,65 25,55 30,50 M40,50 C40,55 45,60 50,60 C55,60 60,55 60,50';
      default:
        return '';
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={getClothingPath()}
        fill={clothingColor}
        stroke="#000"
        strokeWidth="1"
      />
      {accessories.map((accessory, index) => (
        <path
          key={index}
          d={getAccessoryPath(accessory)}
          fill="none"
          stroke="#000"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
} 