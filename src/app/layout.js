import '../styles/globals.css';

export const metadata = {
  title: 'Football Tournament Tracker',
  description: 'Track group standings and rankings easily',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}