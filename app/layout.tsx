import { Provider } from "@/components/ui/provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
