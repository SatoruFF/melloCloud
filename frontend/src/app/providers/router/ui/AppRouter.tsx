import cn from "classnames";
import { Suspense, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAppSelector } from "../../../store/store";

import { Spinner } from "../../../../shared";
import { type IRoute, routes } from "../../../../shared/config/routeConfig/routes";
import { NOT_FOUND } from "../../../../shared/consts/routes";
import { RequireAuth } from "./RequireAuth";

const AppRouter = () => {
  const isUserLoading = useAppSelector((state) => state.user.isUserLoading);

  const renderWithWrapper = useCallback((route: IRoute) => {
    const element = (
      <Suspense fallback={<Spinner fullscreen />}>
        <div className={cn("pageWrapper")}>{route.element}</div>
      </Suspense>
    );

    const wrappedElement = route.private ? <RequireAuth roles={route?.roles}>{element}</RequireAuth> : element;

    // Если есть дочерние роуты
    if (route.children && route.children.length > 0) {
      // Берём первый дочерний роут для редиректа
      const firstChildPath = route.children[0]?.path || "";

      return (
        <Route key={route.path} path={route.path} element={wrappedElement}>
          {/* Редирект на первый дочерний роут */}
          <Route index element={<Navigate to={firstChildPath} replace />} />
          {/* Рендерим дочерние роуты */}
          {route.children.map((child) => {
            const childElement = <Suspense fallback={<Spinner fullscreen />}>{child.element}</Suspense>;

            const wrappedChildElement = child.private ? (
              <RequireAuth roles={child?.roles}>{childElement}</RequireAuth>
            ) : (
              childElement
            );

            return <Route key={child.path} path={child.path} element={wrappedChildElement} />;
          })}
        </Route>
      );
    }

    // Обычный роут без детей
    return <Route key={route.path} path={route.path} element={wrappedElement} />;
  }, []);

  if (isUserLoading) return <Spinner fullscreen />; // FIXME: perhabs not needed anymore

  // TODO: здесь желательно вместо спина добавить виджет PageLoader со скелетоном
  return (
    <Routes>
      {routes.map(renderWithWrapper)}
      <Route path="/*" element={<Navigate replace to={NOT_FOUND} />} />
    </Routes>
  );
};

export default AppRouter;
