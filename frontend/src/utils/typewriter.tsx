import { useState, useEffect, useRef } from 'react';
import { TypewriterEffectProps } from '../types/global';
const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ text, onType, speed = 50 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    setCurrentIndex(0);

    if (!text) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        if (deltaTime > speed) {
          setCurrentIndex((prev) => {
            if (prev < text.length) {
              if (onType) {
                onType();
              }
              return prev + 1;
            } else {
              cancelAnimationFrame(requestRef.current!);
              return prev;
            }
          });
          previousTimeRef.current = time;
        }
      } else {
        previousTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [text, onType, speed]);

  return <>{text.slice(0, currentIndex)}</>;
};

export default TypewriterEffect;