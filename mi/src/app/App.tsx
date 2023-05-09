import { Grommet } from "grommet";
import { QueryClient, QueryClientProvider } from "react-query";

import { AppRoutes } from "./AppRoutes";
import { theme } from "./theme";

const queryClient = new QueryClient();

function App() {
  return (
    <Grommet full themeMode="dark" theme={theme as any}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </Grommet>
  );
}

export default App;
