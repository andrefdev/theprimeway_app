import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@shared/stores/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  return <>{children}</>;
}
