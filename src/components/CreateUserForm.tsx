"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateUserForm() {
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
          formData.set("flow", "signUp");
          void signIn("password", formData).catch((error: any) => {
            let toastTitle = "Não foi possível criar o usuário.";
            if (error.message.includes("User already exists")) {
              toastTitle = "Usuário já existe.";
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
          defaultValue="dhamara@presidencia.com"
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Senha"
          required
          defaultValue="oab@pres"
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? "Criando..." : "Criar Usuário"}
        </button>
      </form>
    </div>
  );
}
