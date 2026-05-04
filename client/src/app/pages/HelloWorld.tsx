import type React from "react";

import { Content, PageSection } from "@patternfly/react-core";

const HelloWorld: React.FC = () => {
  return (
    <PageSection>
      <Content>
        <h1>Hello World</h1>
        <p>Welcome to TSD Console UI.</p>
      </Content>
    </PageSection>
  );
};

export default HelloWorld;
