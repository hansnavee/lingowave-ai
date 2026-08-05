import React, {
  createContext,
  useContext,
  useState,
} from "react";

import { lightTheme, type AppTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";

type ThemeContextType = {
  theme: AppTheme;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
