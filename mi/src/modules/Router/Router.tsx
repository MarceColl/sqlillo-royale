import { useEffect } from "react";
import { useRouterStore } from "./hooks";

type Props = {
  children: React.ReactNode;
};

const Router = ({ children }: Props) => {
  const setPath = useRouterStore((state) => state.setPath);
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  return children ? <>{children}</> : null;
};

export { Router };
