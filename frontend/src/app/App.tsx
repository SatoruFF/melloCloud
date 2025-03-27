import { Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './providers/router';

import './styles/global.scss';

import { useAuthQuery } from '../entities/user/model/api/user';
import MyNavbar from '../widgets/Navbar/ui/Navbar';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { setUser } from '../entities/user/model/slice/userSlice';
import { useAppDispatch } from './store/store';
import { Spinner } from '../shared';

function App() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAuthQuery();

  useEffect(() => {
    // const appEnv = process.env.mode || 'test';

    // console.log('App Environment:', appEnv);
    const check = async () => {
      data && dispatch(setUser(data));
    };
    check();
  }, [data]);

  if (isLoading) {
    return <Spinner fullscreen />;
  }

  // suspense need for i18n
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Spinner fullscreen />}>
          <MyNavbar />
          <AppRouter />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
