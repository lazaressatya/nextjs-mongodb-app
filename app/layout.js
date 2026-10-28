
import "./globals.css";

export const metadata = {
  title: "Nexus HR | Employee Management",
  description: "Employee management dashboard powered by Next.js and MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
