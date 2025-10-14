import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  lazy,
  LocationProvider,
  ErrorBoundary,
  Router,
  Route,
} from "preact-iso";
import MainLayout from "./layouts/main-layout";

const theme = createTheme({
  fontFamily: "LINESeedSansTH",
});

const Product = lazy(() => import("./pages/product-page"));
const NotFound = lazy(() => import("./pages/not-found-page"));

export function App() {
  return (
    <MantineProvider
      defaultColorScheme="light"
      forceColorScheme="light"
      theme={theme}
    >
      <ModalsProvider
        modalProps={{
          overlayProps: {
            backgroundOpacity: 0.55,
            blur: 3,
          },
        }}
      >
        <Notifications position="top-right" />
        <LocationProvider>
          <ErrorBoundary>
            <Router>
              <Route
                path="/"
                component={() => (
                  <MainLayout>
                    <Product />
                  </MainLayout>
                )}
              />
              <Route default component={NotFound} />
            </Router>
          </ErrorBoundary>
        </LocationProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
