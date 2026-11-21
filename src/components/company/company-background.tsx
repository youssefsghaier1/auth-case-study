"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intlayer";
import type { CSSProperties } from "react";
import type { Company } from "@/lib/companies";
import { CompanyCard } from "./company-card";

// Where the 8 cards sit, measured on the 1920x1080 design and kept proportional to the screen.
// Left cards: their right edge (x = 415, 268, 437, 344). Right cards: their left edge (x = 1485, 1635, 1525, 1640).
const percent = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;
const leftCard = (rightEdge: number, top: number): CSSProperties => ({ right: percent(1920 - rightEdge, 1920), top: percent(top, 1080) });
const rightCard = (leftEdge: number, top: number): CSSProperties => ({ left: percent(leftEdge, 1920), top: percent(top, 1080) });

const CARD_POSITIONS: CSSProperties[] = [
  leftCard(415, 57),
  leftCard(268, 317),
  leftCard(437, 587),
  leftCard(344, 856),
  rightCard(1485, 66),
  rightCard(1635, 326),
  rightCard(1525, 599),
  rightCard(1640, 847),
];

const fetchCompanies = async (locale: string): Promise<Company[]> => {
  const response = await fetch(`/api/companies?locale=${locale}`);
  if (!response.ok) throw new Error(`GET /api/companies failed: ${response.status}`);
  return response.json();
};

// Decorative, dimmed company cards behind the auth card. Hidden below 1280px, where they would sit behind the form.
export const CompanyBackground = () => {
  const { locale } = useLocale();
  const { data: companies } = useQuery({
    // The locale is part of the key: French and English lists are cached separately.
    queryKey: ["companies", locale],
    queryFn: () => fetchCompanies(locale),
    // Sample data that does not change during a visit: no refetch on focus or remount.
    staleTime: Infinity,
  });

  // Decoration only: while loading or after an error, show nothing rather than block the page.
  if (!companies) return null;

  return (
    <div className="absolute inset-0 hidden opacity-30 xl:block">
      {companies.slice(0, CARD_POSITIONS.length).map((company, index) => (
        // The soft light halo around each card is only on the page design, not on the card itself (11-mode-carte.png).
        <div
          key={company.id}
          className="absolute rounded-s shadow-[0_0_24px_rgb(255_255_255/24%)]"
          style={CARD_POSITIONS[index]}
        >
          <CompanyCard company={company} />
        </div>
      ))}
    </div>
  );
};
