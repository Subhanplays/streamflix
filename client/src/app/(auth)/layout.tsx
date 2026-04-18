import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.15),_transparent_50%)]" />
      <Link
        href="/"
        className="relative z-10 mb-10 text-3xl font-black tracking-tighter text-netflix drop-shadow-[0_0_24px_rgba(229,9,20,0.4)]"
      >
        Streamflix
      </Link>
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-black/50 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}
