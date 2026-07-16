import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: {
    text: string;
    href: string;
    label: string;
  };
};

export default function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <section className="w-full rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/30">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-zinc-400">AnonChat</p>
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
          </div>

          {children}

          {footer ? (
            <p className="mt-6 text-center text-sm text-zinc-400">
              {footer.text}{" "}
              <Link href={footer.href} className="font-medium text-white hover:text-zinc-200">
                {footer.label}
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
