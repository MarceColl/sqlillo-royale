import { useMutation } from "react-query";

import * as API from "@/API";
import { LoginView } from "@/components";

const LoginPage = () => {
  const { mutateAsync: login, isLoading } = useMutation(API.login, {
    onSuccess: () => {
      window.location.href = "/";
    },
  });
  return <LoginView onSubmit={login} isLoading={isLoading} />;
};

export default LoginPage;
