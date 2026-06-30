import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divyanshu Vashu",
  description: "Divyanshu Vashu portfolio command deck",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const appearance = cookieStore.get("appearance")?.value || "Light";
  const contrast = cookieStore.get("contrast")?.value || "Default";
  const accentColor = cookieStore.get("accentColor")?.value || "Green";

  const appearanceClass = appearance.toLowerCase();
  const contrastClass = contrast === "Increased" ? "high-contrast" : "";
  const accentClass = `accent-${accentColor.toLowerCase()}`;

  const accentColors: Record<string, string> = {
    default: "#10b981",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    pink: "#ec4899",
    orange: "#f97316",
    purple: "#a855f7",
  };

  const accentColorsLight: Record<string, string> = {
    default: "rgba(16, 185, 129, 0.12)",
    blue: "rgba(59, 130, 246, 0.12)",
    green: "rgba(34, 197, 94, 0.12)",
    yellow: "rgba(234, 179, 8, 0.12)",
    pink: "rgba(236, 72, 153, 0.12)",
    orange: "rgba(249, 115, 22, 0.12)",
    purple: "rgba(168, 85, 247, 0.12)",
  };

  const primaryAccent = accentColors[accentColor.toLowerCase()] || "#22c55e";
  const lightAccent = accentColorsLight[accentColor.toLowerCase()] || "rgba(34, 197, 94, 0.12)";

  return (
    <html
      lang="en"
      className={`${appearanceClass} ${contrastClass} ${accentClass}`}
      style={{
        // @ts-ignore
        "--accent-color": primaryAccent,
        "--accent-color-light": lightAccent,
      }}
    >
      <body className="bg-[#fcfcf9] text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}

