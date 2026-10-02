import { useState, type FormEvent } from "react";
import { login } from "@/services/api";

type LoginScreenProps = { onDone: () => void };

export function LoginScreen({ onDone }: LoginScreenProps) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await login(credentials.email, credentials.password);
    if (!result.ok) return setError(result.message);
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Loja da Bia</h1>
        <input
          type="email"
          required
          placeholder="E-mail"
          value={credentials.email}
          onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={credentials.password}
          onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Entrar
        </button>
      </div>
    </form>
  );
}
