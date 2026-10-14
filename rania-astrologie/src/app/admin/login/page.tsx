import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="glass w-full max-w-md rounded-[2rem] p-8 md:p-10">
        <LogoMark className="h-12 w-12 text-gold-bright" />
        <h1 className="mt-6 font-display text-4xl text-ivory">Espace Rania</h1>
        <p className="mt-2 text-sm text-mist">Administration du site — accès réservé.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
