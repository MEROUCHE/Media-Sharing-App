import { useForm } from "react-hook-form";
import { registerSchema, type RegisterPayloadValues } from "../../schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayloadValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterPayloadValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="name" {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}

      <input type="email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
    </form>
  );
}

export default RegisterForm;
