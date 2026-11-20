import { Inter } from "next/font/google";

// Shared by both root layouts ([locale] and /code), so the font is declared once.
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
