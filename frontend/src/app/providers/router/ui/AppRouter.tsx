import cn from "classnames";
import { Suspense, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAppSelector } from "../../../store/store";

import { Spinner } from "../../../../shared";
import { type IRoute, routes } from "../../../../shared";
import { NOT_FOUND } from "../../../../shared";
import { RequireAuth } from "./RequireAuth";
import { RequireAdmin } from "./RequireAdmin";

const AppRouter = () => {
  const isUserLoading = useAppSelector((state) => state.user.isUserLoading);

  const renderWithWrapper = useCallback((route: IRoute) => {
    const element = (
      <Suspense fallback={<Spinner fullscreen />}>
        <div className={cn("pageWrapper")}>{route.element}</div>
      </Suspense>
    );

    const wrappedElement = route.private
      ? route.adminOnly
        ? (
            <RequireAuth roles={route?.roles ?? []}>
              <RequireAdmin>{element}</RequireAdmin>
            </RequireAuth>
          )
        : (
            <RequireAuth roles={route?.roles ?? []}>{element}</RequireAuth>
          )
      : element;

    // If there are child routes
    if (route.children && route.children.length > 0) {
      // We take the first child router for the redirect
      const firstChildPath = route.children[0]?.path || "";

      return (
        <Route key={route.path} path={route.path} element={wrappedElement}>
          {/* Redirect to the first child router */}
          <Route index element={<Navigate to={firstChildPath} replace />} />
          {/* Rendering child routes */}
          {route.children.map((child) => {
            const childElement = <Suspense fallback={<Spinner fullscreen />}>{child.element}</Suspense>;

            const wrappedChildElement = child.private ? (
              <RequireAuth roles={child?.roles ?? []}>{childElement}</RequireAuth>
            ) : (
              childElement
            );

            return <Route key={child.path} path={child.path} element={wrappedChildElement} />;
          })}
        </Route>
      );
    }

    // A regular router without children
    return <Route key={route.path} path={route.path} element={wrappedElement} />;
  }, []);

  if (isUserLoading) return <Spinner fullscreen />; // FIXME: perhabs not needed anymore

  // TODO: here it is advisable to add a PageLoader widget with a skeleton instead of a spin.
  return (
    <Routes>
      {routes.map(renderWithWrapper)}
      <Route path="/*" element={<Navigate replace to={NOT_FOUND} />} />
    </Routes>
  );
};

export default AppRouter;
