import { Spin } from 'antd';
import cn from 'classnames';
import { Suspense, useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAppSelector } from '../../../store/store';

import { IRoute, routes } from '../../../../shared/config/routeConfig/routes';
import { NOT_FOUND } from '../../../../shared/consts/routes';
import { RequireAuth } from './RequireAuth';

const AppRouter = () => {
  const isUserLoading = useAppSelector(state => state.user.isUserLoading);

  const renderWithWrapper = useCallback((route: IRoute) => {
    const element = (
      <Suspense fallback={<Spin />}>
        <div className={cn('pageWrapper')}>{route.element}</div>
      </Suspense>
    );

    return (
      <Route
        key={route.path}
        path={route.path}
        element={route.private ? <RequireAuth roles={route?.roles}>{element}</RequireAuth> : element}
      />
    );
  }, []);

  if (isUserLoading) return <Spin />; // FIXME: perhabs not needed anymore

  // TODO: здесь желательно вместо спина добавить виджет PageLoader со скелетоном
  return (
    <Routes>
      {routes.map(renderWithWrapper)}
      <Route path="/*" element={<Navigate replace to={NOT_FOUND} />} />
    </Routes>
  );
};

export default AppRouter;
