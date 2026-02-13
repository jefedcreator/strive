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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-slate-900">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 space-y-8 text-center duration-1000">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
            Welcome, {(user.username ?? user.name) ?? "Runner"}
          </h1>
          <p className="font-medium text-slate-500">
            You are successfully connected.
          </p>
        </div>

        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/60">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-slate-100 shadow-inner">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-4xl font-bold text-slate-400">
                    {((user.username?.[0] ?? user.name?.[0]) ?? "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-green-500 shadow-sm" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">{user.username ?? user.name}</h2>
              <p className="text-sm font-medium text-slate-400">{user.email}</p>
            </div>

            <div className="h-px w-full bg-slate-100" />

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="w-full"
            >
              <Button
                variant="outline"
                isFullWidth
                type="submit"
                className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
