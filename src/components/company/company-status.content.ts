import { type Dictionary, t } from "intlayer";

// Badge labels. CLOSED and INACTIVE share "closed"; ACTIVE has no badge (see company-card.tsx).
const companyStatusContent = {
  key: "company-status",
  content: {
    closed: t({ fr: "Fermée", en: "Closed" }),
    sold: t({ fr: "Vendue", en: "Sold" }),
  },
} satisfies Dictionary;

export default companyStatusContent;
