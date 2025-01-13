import { useEffect } from 'react';
import { AppRouter } from './providers/router';
import { BrowserRouter } from 'react-router-dom';
import MyNavbar from '../widgets/Navbar/ui/Navbar';
import './styles/global.scss';
import { useAppDispatch } from '../store/store';
import { useAuthQuery } from '../TEMP/services/user';
import { setUser } from '../store/reducers/userSlice';
import { Spin } from 'antd';

function App() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAuthQuery();

  useEffect(() => {
    const check = async () => {
      dispatch(setUser(data));
    };
    check();
  }, [data]);

  if (isLoading) {
    return <Spin style={{ width: '100%', height: '100vh', marginTop: '400px' }} />;
  }

  return (
    <BrowserRouter>
      <MyNavbar />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
