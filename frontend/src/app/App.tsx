import { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import cn from "classnames";
import { AppRouter } from "./providers/router";

import { useAuthQuery } from "../entities/user";
import { setUser } from "../entities/user";
import { Spinner } from "../shared";
import { setFeatureFlags } from "../shared/lib/features/setGetFeatures";
import { useGetFeatureFlagsQuery } from "../shared/api/featureFlagsApi";
import { Navbar as MyNavbar } from "../widgets/Navbar";
import { AddToHomeScreenBanner } from "../features/addToHomeScreen";
import { ErrorBoundary } from "./providers/ErrorBoundary";
import { useAppDispatch } from "./store/store";

import "./styles/global.scss";
import styles from "./styles/application.module.scss";

function App() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAuthQuery();
  const { data: flagsData } = useGetFeatureFlagsQuery(undefined, { skip: !data });

  useEffect(() => {
    const check = async () => {
      data && dispatch(setUser(data));
    };
    check();
  }, [data, dispatch]);

  useEffect(() => {
    if (flagsData) {
      setFeatureFlags(flagsData);
    }
  }, [flagsData]);

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
            <AddToHomeScreenBanner />
          </Suspense>
        </main>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
