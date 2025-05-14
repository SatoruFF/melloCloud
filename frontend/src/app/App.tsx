import { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import cn from "classnames";
import { AppRouter } from "./providers/router";

import "./styles/global.scss";

import { useAuthQuery } from "../entities/user/model/api/user";
import { setUser } from "../entities/user/model/slice/userSlice";
import { Spinner } from "../shared";
import MyNavbar from "../widgets/Navbar/ui/Navbar";
import { ErrorBoundary } from "./providers/ErrorBoundary";
import { useAppDispatch } from "./store/store";

import styles from "./styles/application.module.scss";

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
        <main className={cn(styles.application)}>
          <Suspense fallback={<Spinner fullscreen />}>
            <MyNavbar />
            <AppRouter />
          </Suspense>
        </main>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
