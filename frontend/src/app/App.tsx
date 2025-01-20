import { Suspense, useEffect } from 'react';
import { AppRouter } from './providers/router';
import { BrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';

import './styles/global.scss';

import MyNavbar from '../widgets/Navbar/ui/Navbar';
import { useAppDispatch } from './store/store';
import { useAuthQuery } from '../shared/api/user';
import { setUser } from './store/reducers/userSlice';

function App() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAuthQuery();

  useEffect(() => {
    // const appEnv = process.env.mode || 'test';

    // console.log('App Environment:', appEnv);
    const check = async () => {
      dispatch(setUser(data));
    };
    check();
  }, [data]);

  if (isLoading) {
    return <Spin style={{ width: '100%', height: '100vh', marginTop: '400px' }} />;
  }

  // suspense need for i18n
  return (
    <BrowserRouter>
      <Suspense fallback={''}>
        <MyNavbar />
        <AppRouter />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
