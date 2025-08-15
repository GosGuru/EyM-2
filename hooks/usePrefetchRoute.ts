"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function usePrefetchRoute(href: string, enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (enabled && href) {
      router.prefetch(href);
    }
  }, [router, href, enabled]);

  const prefetchOnHover = () => {
    if (enabled && href) {
      router.prefetch(href);
    }
  };

  return { prefetchOnHover };
}
