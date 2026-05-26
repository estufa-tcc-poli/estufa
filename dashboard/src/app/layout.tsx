import type { Metadata } from "next";
import { WireNav } from "@/components/wireframe";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCC — Wireframes IoT",
  description: "Wireframes de baixa fidelidade — monitoramento IoT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <WireNav />
        <main className="mx-auto max-w-4xl p-6">{children}</main>
      </body>
    </html>
  );
}
