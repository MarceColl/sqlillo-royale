import { Grommet } from "grommet";
import { QueryClient, QueryClientProvider } from "react-query";

import { AppRoutes } from "./AppRoutes";
import { theme } from "./theme";
import { GlobalStyle } from "./globalStyles";

const queryClient = new QueryClient();

function App() {
  return (
    <Grommet full themeMode="dark" theme={theme as any}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </Grommet>
  );
}

export default App;
