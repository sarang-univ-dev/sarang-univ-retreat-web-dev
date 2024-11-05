import { RegistrationProvider } from "@/context/retreatContext";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
