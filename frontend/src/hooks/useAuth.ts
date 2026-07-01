import { useMutation } from "@tanstack/react-query";
import { login, register } from "../services/auth.service";
import type { AuthResponse } from "../types/auth.types";

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("token", data.token);
      console.log("login success")
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("token", data.token);
      console.log("register success")
    },
  });
}