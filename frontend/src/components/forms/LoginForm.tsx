import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginPayloadValues } from "../../schemas/auth.schema";
import { useLogin } from "../../hooks/useAuth";

function LoginForm() {
  const { mutate, isPending, isError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayloadValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginPayloadValues) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}

      {isError && <p>login failed</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Loading..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
