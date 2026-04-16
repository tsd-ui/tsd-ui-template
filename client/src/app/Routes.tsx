import { Navigate, useRoutes } from "react-router-dom";

import HelloWorld from "./pages/HelloWorld";

export const Paths = {
  home: "/home",
} as const;

export const AppRoutes = () => {
  const allRoutes = useRoutes([
    { path: "/", element: <Navigate to={Paths.home} /> },
    { path: Paths.home, element: <HelloWorld /> },
  ]);

  return allRoutes;
};
