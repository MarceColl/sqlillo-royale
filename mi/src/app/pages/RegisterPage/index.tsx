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
  repassword: string;
};

const RegisterPage = () => {
  const { goTo } = useRouter();
  const { register } = useAuth();
  const handleSubmit = async ({ value }: { value: Credentials }) => {
    const { password, repassword } = value;
    if (password !== repassword) {
      // TODO: toast
      alert("Passwords do not match");
      return;
    }
    if (register.isLoading) return;
    try {
      await register.mutateAsync(value);
    } catch (error) {
      // TODO: toasts
      alert(`Error: ${(error as Error).message}`);
    }
    goTo(Routes.home);
  };
  return (
    <Main align="center" justify="center">
      <Card>
        <CardHeader>
          <Box justify="center">
            <Heading size="small">Join the challenge</Heading>
          </Box>
        </CardHeader>
        <CardBody>
          <Space small />
          <Form onSubmit={handleSubmit}>
            <FormField
              name="username"
              label="Username"
              disabled={register.isLoading}
            />
            <Space small />
            <FormField
              name="password"
              label="Password"
              type="password"
              disabled={register.isLoading}
            />
            <Space small />
            <FormField
              name="repassword"
              label="Repeat Password"
              type="password"
              disabled={register.isLoading}
            />
            <Space small />
            <Box>
              <Button
                primary
                type="submit"
                disabled={register.isLoading}
                label="Register"
                size="large"
                busy={register.isLoading}
              />
            </Box>
          </Form>
        </CardBody>
        <CardFooter>
          <div>
            Or{" "}
            <Link to={Routes.login}>
              <Anchor label="login" margin="none" />
            </Link>{" "}
            if you already have an account
          </div>
        </CardFooter>
      </Card>
    </Main>
  );
};

export { RegisterPage };
