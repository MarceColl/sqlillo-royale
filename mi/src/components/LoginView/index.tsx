import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormField,
  Main,
} from "grommet";

type Credentials = {
  username: string;
  password: string;
};

type Props = {
  onSubmit: (values: Credentials) => void;
  isLoading: boolean;
};

const LoginView = ({ onSubmit, isLoading }: Props) => {
  const handleSubmit = ({ value }: { value: Credentials }) => {
    if (isLoading) return;
    onSubmit(value);
  };
  return (
    <Main align="center" justify="center">
      <Card>
        <CardHeader>Login</CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormField name="username" label="Username" disabled={isLoading} />
            <FormField name="password" label="Password" disabled={isLoading} />
            <Button
              primary
              type="submit"
              disabled={isLoading}
              label="Login"
              busy={isLoading}
            />
          </Form>
        </CardBody>
      </Card>
    </Main>
  );
};

export default LoginView;
