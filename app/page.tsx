import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-[10px] p-10 text-center shadow-2xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">SPKS Exams Admin</h1>
        <p className="text-muted-foreground text-[0.95rem] mb-7">Sign in or create an account to continue.</p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center py-2.5 px-5 text-[0.95rem] font-medium rounded-md bg-primary text-white hover:bg-primary/90 transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center py-2.5 px-5 text-[0.95rem] font-medium rounded-md bg-transparent text-foreground border border-border hover:bg-secondary hover:border-primary transition"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
