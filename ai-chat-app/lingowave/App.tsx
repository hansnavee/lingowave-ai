import RootNavigator from "./src/navigation/RootNavigation";
import { ThemeProvider } from "./src/theme/themeContext";

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
