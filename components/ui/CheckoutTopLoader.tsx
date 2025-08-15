"use client";

import { useEffect, useState } from "react";

interface CheckoutTopLoaderProps {
  isLoading: boolean;
  message?: string;
}

export default function CheckoutTopLoader({ isLoading, message }: CheckoutTopLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    let progressTimer: NodeJS.Timeout;
    
    const animateProgress = () => {
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // No llegar al 100% hasta terminar
          const increment = Math.random() * 10 + 5; // Entre 5% y 15%
          return Math.min(prev + increment, 90);
        });
      }, 300);
    };

    animateProgress();

    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && progress > 0) {
      // Completar al 100% cuando termine la carga
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Barra de progreso superior */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-eym-accent-orange to-eym-dark transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Mensaje de estado opcional */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur border rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-eym-dark">
            <div className="w-4 h-4 border-2 border-eym-accent-orange border-t-transparent rounded-full animate-spin" />
            <span>{message}</span>
          </div>
        </div>
      )}
    </>
  );
}
