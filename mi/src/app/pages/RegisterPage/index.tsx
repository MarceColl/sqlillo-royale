import { Form } from "grommet";
import { Button, Card, CardBody, CardHeader, FormField, Main } from "@/app/ui";

import { useAuth } from "@/app/hooks";
import { useRouter } from "@/modules/Router";
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
        <CardHeader>Register</CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormField
              name="username"
              label="Username"
              disabled={register.isLoading}
            />
            <FormField
              name="password"
              label="Password"
              disabled={register.isLoading}
            />
            <FormField
              name="repassword"
              label="Repeat Password"
              disabled={register.isLoading}
            />
            <Button
              primary
              type="submit"
              disabled={register.isLoading}
              label="Register"
              busy={register.isLoading}
            />
          </Form>
        </CardBody>
      </Card>
    </Main>
  );
};

export { RegisterPage };
