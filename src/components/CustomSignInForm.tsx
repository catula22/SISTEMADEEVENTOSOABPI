"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function CustomSignInForm() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", "signIn");
          void signIn("password", formData).catch((error: any) => {
            let toastTitle = "Não foi possível fazer login. Verifique suas credenciais.";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Senha inválida. Por favor, tente novamente.";
            } else if (error.message.includes("No user with that email")) {
              toastTitle = "Nenhum usuário encontrado com este email.";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Senha"
          required
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
