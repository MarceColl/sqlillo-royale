import { Grommet } from "grommet";
import { QueryClient, QueryClientProvider } from "react-query";

import { AppRoutes } from "./AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <Grommet full themeMode="auto">
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </Grommet>
  );
}

export default App;
