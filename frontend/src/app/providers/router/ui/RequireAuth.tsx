import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../store/store";
import { getUserAuthSelector, UserRolesType } from "../../../../entities/user";
import { WELCOME_ROUTE } from "../../../../shared";

export function RequireAuth({ children }: { children: ReactNode; roles: UserRolesType[] }) {
  const isAuth = useAppSelector(getUserAuthSelector);
  const location = useLocation();

  // TODO: role-based policy on an array of rights! Lesson number: 73
  // TODO: add forbidden Page
  if (!isAuth) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to={WELCOME_ROUTE} state={{ from: location }} replace />;
  }

  return children;
}
