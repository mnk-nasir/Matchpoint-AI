import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../utils/cn";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const val = value[0];

  const calculateValue = (clientX: number) => {
    if (!containerRef.current) return val;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(max, Math.max(min, steppedValue));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const newValue = calculateValue(e.clientX);
    onValueChange([newValue]);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const newValue = calculateValue(e.clientX);
        onValueChange([newValue]);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, min, max, step, onValueChange]); // Dependencies for effect

  const percentage = ((val - min) / (max - min)) * 100;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-6 w-full cursor-pointer items-center touch-none select-none",
        className
      )}
      onPointerDown={handlePointerDown}
    >
      {/* Track Background */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        {/* Fill */}
        <div
          className="absolute h-full bg-gradient-to-r from-web3-primary to-web3-purple transition-all duration-75 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Thumb */}
      <div
        className={cn(
          "absolute h-5 w-5 rounded-full border-2 border-white bg-web3-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform duration-100 hover:scale-110",
          isDragging && "scale-110 cursor-grabbing"
        )}
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
}
