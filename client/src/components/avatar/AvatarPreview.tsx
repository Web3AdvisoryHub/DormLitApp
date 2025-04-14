import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AvatarCustomization } from '@/types/avatar';

interface AvatarPreviewProps {
  customization: AvatarCustomization;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
}

export function AvatarPreview({
  customization,
  className,
  size = 'md',
  showControls = true,
}: AvatarPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw avatar layers
    const drawAvatar = () => {
      // Draw base (skin tone)
      ctx.fillStyle = customization.skinTone;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw hair
      ctx.fillStyle = customization.hairColor;
      // Hair style logic would go here
      // This is a simplified example
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 20, canvas.width / 3 + 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw clothing
      ctx.fillStyle = customization.clothingColor;
      // Clothing style logic would go here
      ctx.beginPath();
      ctx.rect(
        canvas.width / 2 - 30,
        canvas.height / 2 + 20,
        60,
        40
      );
      ctx.fill();

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(drawAvatar);
    };

    drawAvatar();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [customization]);

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative overflow-hidden rounded-full bg-background",
          sizeClasses[size]
        )}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={size === 'sm' ? 128 : size === 'md' ? 256 : 384}
          height={size === 'sm' ? 128 : size === 'md' ? 256 : 384}
        />
      </motion.div>

      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => {
              // Rotate left
              if (canvasRef.current) {
                canvasRef.current.style.transform = `rotate(${
                  (parseInt(canvasRef.current.style.transform.replace('rotate(', '').replace('deg)', '')) || 0) - 45
                }deg)`;
              }
            }}
          >
            ↺
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => {
              // Rotate right
              if (canvasRef.current) {
                canvasRef.current.style.transform = `rotate(${
                  (parseInt(canvasRef.current.style.transform.replace('rotate(', '').replace('deg)', '')) || 0) + 45
                }deg)`;
              }
            }}
          >
            ↻
          </motion.button>
        </div>
      )}
    </div>
  );
} 