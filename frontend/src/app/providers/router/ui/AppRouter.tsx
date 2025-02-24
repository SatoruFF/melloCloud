import { Suspense, useCallback } from 'react';
import { Spin } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import cn from 'classnames';

import { useAppSelector } from '../../../store/store';

import { NOT_FOUND } from '../../../../shared/consts/routes';
import { routes, IRoute } from '../../../../shared/config/routeConfig/routes';
import { RequireAuth } from './RequireAuth';

const AppRouter = () => {
  const isAuth = useAppSelector(state => state.users.isAuth);
  const isUserLoading = useAppSelector(state => state.users.isUserLoading);

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
        element={route.private ? <RequireAuth>{element}</RequireAuth> : element}
      />
    );
  }, []);

  if (isUserLoading) return <Spin />; // FIXME: perhabs not needed anymore

  // TODO: здесь желательно вместо спина добавить виджет PageLoader
  return (
    <Routes>
      {routes.map(renderWithWrapper)}
      <Route path="/*" element={<Navigate replace to={NOT_FOUND} />} />
    </Routes>
  );
};

export default AppRouter;
