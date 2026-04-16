import "./App.css";
import type React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { ThemeProvider, type ThemeMode } from "tsd-ui";

import { useLocalStorage } from "@app/hooks/useStorage";

import { AppRoutes } from "./Routes";
import { DefaultLayout } from "./layout";

import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/patternfly-addons.css";

export const STORAGE_KEY = "theme-preference";

const App: React.FC = () => {
  const [mode, setMode] = useLocalStorage<ThemeMode>({
    key: STORAGE_KEY,
    defaultValue: "system",
  });

  return (
    <ThemeProvider mode={mode} setMode={setMode}>
      <Router basename={import.meta.env.BASE_URL}>
        <DefaultLayout>
          <AppRoutes />
        </DefaultLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
