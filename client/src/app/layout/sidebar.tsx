import type React from "react";

import { Nav, NavList, PageSidebar, PageSidebarBody } from "@patternfly/react-core";
import nav from "@patternfly/react-styles/css/components/Nav/nav";

export const SidebarApp: React.FC = () => {
  return (
    <PageSidebar>
      <PageSidebarBody>
        <Nav id="nav-sidebar" aria-label="Nav">
          <NavList>
            <li className={nav.navItem}>
              <a href="/" className={nav.navLink}>Home</a>
            </li>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
};
