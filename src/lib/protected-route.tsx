import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'employee';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {

    const {data,isLoading,isError} = useCurrentUser() 
    console.log(data);
    
  const user = useAuthStore((s) => s.admin);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const location = useLocation();

  // Wait for localStorage rehydration before deciding.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }



  return <>{children}</>;
}
