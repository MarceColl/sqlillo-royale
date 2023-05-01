import { Grommet } from "grommet";
import { QueryClient, QueryClientProvider } from "react-query";

import Router from "./Router";

const queryClient = new QueryClient();

function App() {
  return (
    <Grommet full themeMode="auto">
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </Grommet>
  );
}

export default App;
