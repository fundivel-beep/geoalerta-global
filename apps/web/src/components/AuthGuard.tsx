'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_ROUTES = ['/login', '/registro'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!token && !isPublic) {
      router.replace('/login');
      setIsAuth(false);
    } else if (token && isPublic) {
      // Already logged in, redirect to home
      router.replace('/');
      setIsAuth(true);
    } else {
      setIsAuth(true);
    }
  }, [pathname, router]);

  // Show nothing while checking auth
  if (isAuth === null) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl animate-pulse">
            🌐
          </div>
          <p className="text-xs text-gray-500">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuth && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
