import type React from "react";
import { Brand } from "@patternfly/react-core";
import { useIsDarkMode } from "@app/hooks/useDarkMode";

interface ThemeAwareLogoProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  heights: { default: string };
}

export const ThemeAwareLogo: React.FC<ThemeAwareLogoProps> = ({ lightSrc, darkSrc, alt, heights }) => {
  const isDark = useIsDarkMode();

  const themedLogoSrc = isDark ? darkSrc : lightSrc;
  return <Brand src={themedLogoSrc} alt={alt} heights={heights} />;
};
