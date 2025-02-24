import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../store/store';
import { WELCOME_ROUTE } from '../../../../shared/consts/routes';
import { ReactNode } from 'react';

export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuth = useAppSelector(state => state.users.isAuth);
  const location = useLocation();

  if (!isAuth) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to={WELCOME_ROUTE} state={{ from: location }} replace />;
  }

  return children;
}
