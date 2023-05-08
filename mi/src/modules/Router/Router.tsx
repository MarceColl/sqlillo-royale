import { useEffect } from "react";
import { useRouterStore } from "./hooks";

type Props = {
  children: React.ReactNode;
};

const Router = ({ children }: Props) => {
  useEffect(() => {
    if (window.location.hash === "") {
      window.location.hash = "#/";
    }
  }, []);
  const setPath = useRouterStore((state) => state.setPath);
  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash.slice(1));
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  return children ? <>{children}</> : null;
};

export { Router };
