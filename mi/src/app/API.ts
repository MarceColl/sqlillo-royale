import { wait } from "../utils";

type LoginInput = { username: string; password: string };
type LoginOutput = { token: string };
const login = async ({
  username,
  password,
}: LoginInput): Promise<LoginOutput> => {
  // TODO
  console.log("[API] login", username, password);
  await wait(500);
  return { token: `${username}-${password}` };
};

type RegisterInput = { username: string; password: string };
type RegisterOutput = { success: boolean };
const register = async ({
  username,
  password,
}: RegisterInput): Promise<RegisterOutput> => {
  // TODO
  console.log("[API] register", username, password);
  await wait(500);
  return { success: true };
};

export { login, register };
