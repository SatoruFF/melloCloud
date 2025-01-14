import { Suspense } from 'react';
import { Spin } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAppSelector } from '../../../store/store';

import { WELCOME_ROUTE } from '../../../../shared/consts/consts';
import { routes, privateRoutes } from '../../../../shared/config/routeConfig/routes';

const AppRouter = () => {
  const isAuth = useAppSelector((state) => state.users.isAuth);

  return (
    <Suspense fallback={<Spin />}>
      <Routes>
        {isAuth ? (
          <>
            {privateRoutes.map((item) => (
              <Route key={item.path} path={item.path} element={<item.element />} />
            ))}
          </>
        ) : (
          <>
            {routes.map((item) => (
              <Route key={item.path} path={item.path} element={<item.element />} />
            ))}
          </>
        )}
        <Route path="/*" element={<Navigate replace to={WELCOME_ROUTE} />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
