import { wait } from "./utils";

type LoginInput = { username: string; password: string };
type LoginOutput = { token: string };
const login = async ({
  username,
  password,
}: LoginInput): Promise<LoginOutput> => {
  // TODO
  await wait(500);
  return { token: `${username}-${password}` };
};

export { login };
