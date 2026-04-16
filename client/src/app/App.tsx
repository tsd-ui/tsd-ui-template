import "./App.css";
import type React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { AppRoutes } from "./Routes";
import { DefaultLayout } from "./layout";
import { DarkModeProvider } from "./hooks/useDarkMode";

import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/patternfly-addons.css";

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <DefaultLayout>
          <AppRoutes />
        </DefaultLayout>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
