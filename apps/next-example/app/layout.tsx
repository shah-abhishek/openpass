export const metadata = { title: 'OpenPass Next Example' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', padding: 24 }}>{children}</body>
    </html>
  );
}
