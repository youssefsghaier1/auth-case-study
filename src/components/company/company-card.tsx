import { useIntlayer } from "next-intlayer";
import { SectorTag } from "@/components/sectors/sector-tag";
import type { Company } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { CompanyStatus } from "./company-status";

// Which badge each status shows: CLOSED and INACTIVE read "closed", ACQUIRED "sold", ACTIVE none.
const STATUS_BADGE: Record<CompanyStatus, { label: "closed" | "sold"; className: string } | null> = {
  [CompanyStatus.ACTIVE]: null,
  [CompanyStatus.CLOSED]: { label: "closed", className: "bg-danger-50 text-danger" },
  [CompanyStatus.INACTIVE]: { label: "closed", className: "bg-danger-50 text-danger" },
  [CompanyStatus.ACQUIRED]: { label: "sold", className: "bg-warning-50 text-warning" },
};

// Company card as in design/11-mode-carte.png (552 x 160 px). Dimming is up to the caller.
export const CompanyCard = ({ company }: { company: Company }) => {
  const sectorNames = useIntlayer("sectors");
  const statusLabels = useIntlayer("company-status");
  const badge = STATUS_BADGE[company.status];
  const initial = company.name.charAt(0);

  return (
    <article className="glassmorphism h-[160px] w-[552px] overflow-hidden rounded-s p-[18px]">
      {/* Large faded initial in the top-left corner. */}
      <span aria-hidden className="absolute -top-[22px] -left-[6px] text-[166px] leading-none font-normal text-white/10 italic">
        {initial}
      </span>

      <div className="relative flex items-center gap-sm">
        <span
          className="flex size-[38px] shrink-0 items-center justify-center rounded-full text-[22px] italic"
          style={{ backgroundColor: company.logoColor }}
        >
          {initial}
        </span>
        <h3 className="text-ms font-semibold">{company.name}</h3>
      </div>

      {badge && (
        // text-[length:...]: inside cn(), tailwind-merge would drop the custom "text-xs-plus" next to the badge colour.
        <span
          className={cn(
            "absolute top-[18px] right-[18px] rounded-xs px-s py-xs text-[length:var(--text-xs-plus)] leading-4",
            badge.className,
          )}
        >
          {statusLabels[badge.label].value}
        </span>
      )}

      <p className="relative mt-[14px] line-clamp-2 max-w-[360px] text-xs-plus leading-[18px] font-light tracking-normal">
        {company.description}
      </p>

      <ul className="relative mt-[14px] flex gap-[26px]">
        {company.sectors.map((sector) => (
          <li key={sector}>
            <SectorTag sector={sector} label={sectorNames[sector].value} isMonochrome />
          </li>
        ))}
      </ul>
    </article>
  );
};
