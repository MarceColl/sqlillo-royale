import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormField,
  Main,
} from "grommet";

import { useAuth } from "@/app/hooks";
import { useRouter } from "@/modules/Router";
import { Routes } from "@/app/constants";

type Credentials = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const { goTo } = useRouter();
  const { login } = useAuth();
  const handleSubmit = async ({ value }: { value: Credentials }) => {
    if (login.isLoading) return;
    try {
      await login.mutateAsync(value);
    } catch (error) {
      // TODO: toasts
      alert(`Error: ${(error as Error).message}`);
    }
    goTo(Routes.home);
  };
  return (
    <Main align="center" justify="center">
      <Card>
        <CardHeader>Login</CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormField
              name="username"
              label="Username"
              disabled={login.isLoading}
            />
            <FormField
              name="password"
              label="Password"
              disabled={login.isLoading}
            />
            <Button
              primary
              type="submit"
              disabled={login.isLoading}
              label="Login"
              busy={login.isLoading}
            />
          </Form>
        </CardBody>
      </Card>
    </Main>
  );
};

export { LoginPage };
