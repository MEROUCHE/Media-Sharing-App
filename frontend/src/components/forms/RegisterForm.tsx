import { useForm } from "react-hook-form";
import { registerSchema, type RegisterPayloadValues } from "../../schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../hooks/useAuth";

function RegisterForm() {
  const { mutate, isPending, isError } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayloadValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterPayloadValues) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}

      <input type="email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}

      {isError && <p>register failed</p>}

      <button disabled={isPending} type="submit">
        {isPending ? "Loading..." : "Register"}
      </button>
    </form>
  );
}

export default RegisterForm;