import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/primitives";
import { signOut } from "@/server/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { user } = session;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-1000">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Welcome, {user.username ?? user.name ?? "Runner"}
        </h1>
        <p className="font-medium text-slate-500">
          You are successfully connected. Heres your fitness overview.
        </p>
      </div>
    </div>
  );
}
