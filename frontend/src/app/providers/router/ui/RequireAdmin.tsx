import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../../store/store";
import { checkIsAdmin, getUserAuthSelector } from "../../../../entities/user";
import { NOT_FOUND } from "../../../../shared";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const isAuth = useAppSelector(getUserAuthSelector);
  const isAdmin = useAppSelector(checkIsAdmin);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to={NOT_FOUND} replace />;
  }

  return <>{children}</>;
}
