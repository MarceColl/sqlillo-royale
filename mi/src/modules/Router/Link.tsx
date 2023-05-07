import { useRouter } from "./hooks";
import { PathParams } from ".";

type Props<T extends string> = {
  to: T;
  params?: PathParams<T>;
  state?: Record<string, unknown>;
  children: React.ReactNode;
};

const Link = <T extends string>({ children, to, params, state }: Props<T>) => {
  const { goTo } = useRouter();
  const handleClick = () => {
    goTo({ path: to, params, state });
  };
  return <span onClick={handleClick}>{children}</span>;
};

export { Link };
