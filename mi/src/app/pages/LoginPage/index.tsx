import { Form } from "grommet";
import {
  Anchor,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormField,
  Heading,
  Main,
  Space,
} from "@/app/ui";

import { useAuth } from "@/app/hooks";
import { Link, useRouter } from "@/modules/Router";
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
      goTo(Routes.home);
    } catch (error) {
      // TODO: toasts
      alert(`Error: ${(error as Error).message}`);
    }
  };
  return (
    <Main align="center" justify="center">
      <Card>
        <CardHeader>
          <Box justify="center">
            <Heading size="small">Welcome back</Heading>
          </Box>
        </CardHeader>
        <CardBody>
          <Space small />
          <Form onSubmit={handleSubmit}>
            <FormField
              name="username"
              label="Username"
              disabled={login.isLoading}
            />
            <Space small />
            <FormField
              name="password"
              label="Password"
              type="password"
              disabled={login.isLoading}
            />
            <Space small />
            <Box>
              <Button
                primary
                type="submit"
                disabled={login.isLoading}
                label="Login"
                size="large"
                busy={login.isLoading}
              />
            </Box>
          </Form>
        </CardBody>
        <CardFooter>
          <div>
            Or{" "}
            <Link to={Routes.register}>
              <Anchor label="register" margin="none" />
            </Link>{" "}
            if you don't have an account
          </div>
        </CardFooter>
      </Card>
    </Main>
  );
};

export { LoginPage };
