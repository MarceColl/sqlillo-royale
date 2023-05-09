import { useEffect } from "react";
import { useRouter } from "./hooks";

type Props = {
  children: React.ReactNode;
};

const Router = ({ children }: Props) => {
  const { goTo } = useRouter();
  useEffect(() => {
    if (window.location.hash === "") {
      goTo("/");
    }
  }, []);
  useEffect(() => {
    const handleHashChange = () => {
      goTo(window.location.hash.slice(1));
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  return children ? <>{children}</> : null;
};

export { Router };
