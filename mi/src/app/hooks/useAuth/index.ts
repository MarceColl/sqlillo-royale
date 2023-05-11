import { create } from "zustand";
import { useMutation } from "react-query";

import * as API from "@/app/API";

type State = {
  token: string | null;
};

type Actions = {
  setToken: (token: string | null) => void;
};

const useAuthStore = create<State & Actions>()((set) => ({
  token: localStorage.getItem("token"),
  setToken: (token: string | null) => {
    localStorage.setItem("token", token || "");
    set({ token });
  },
}));

export const useAuth = () => {
  const { token, setToken } = useAuthStore();
  const login = useMutation(API.login, {
    mutationKey: "login",
    onSuccess: ({ token }) => setToken(token),
  });
  const register = useMutation(API.register, {
    mutationKey: "register",
  });
  const logout = () => {
    setToken(null);
    window.location.reload();
  };

  return {
    login: login,
    register: register,
    logout,
    isAuthenticated: !!token,
  };
};
