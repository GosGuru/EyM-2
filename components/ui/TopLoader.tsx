"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let finishTimer: NodeJS.Timeout;

    const startLoading = () => {
      setLoading(true);
      setProgress(0);
      
      // Progreso simulado que se acelera
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev; // No llegar al 100% hasta que termine
          const increment = Math.random() * 15 + 5; // Entre 5% y 20%
          return Math.min(prev + increment, 95);
        });
      }, 200);
    };

    const finishLoading = () => {
      setProgress(100);
      finishTimer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    };

    // Detectar navegación programática vía View Transitions
    const handleNavigationStart = () => {
      startLoading();
    };

    const handleNavigationEnd = () => {
      clearInterval(progressTimer);
      finishLoading();
    };

    // Escuchar eventos custom de OptimizedLink
    window.addEventListener('navigation:start', handleNavigationStart);
    window.addEventListener('navigation:end', handleNavigationEnd);

    // Cleanup inmediato si ya cambió la ruta
    handleNavigationEnd();

    return () => {
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
      window.removeEventListener('navigation:start', handleNavigationStart);
      window.removeEventListener('navigation:end', handleNavigationEnd);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-eym-accent-orange via-orange-400 to-eym-accent-orange opacity-90 shadow-sm"
      style={{
        width: `${progress}%`,
        transition: 'width 0.2s ease-out',
      }}
    />
  );
}
