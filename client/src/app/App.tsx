import "./App.css";
import type React from "react";

import { ThemeProvider, type ThemeMode } from "tsd-ui";

import { useLocalStorage } from "@app/hooks/useStorage";

import { DefaultLayout } from "./layout";
import HelloWorld from "./pages/HelloWorld";

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
      <DefaultLayout>
        <HelloWorld />
      </DefaultLayout>
    </ThemeProvider>
  );
};

export default App;
