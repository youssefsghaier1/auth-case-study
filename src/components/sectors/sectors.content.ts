import { type Dictionary, t } from "intlayer";
import type { Sector } from "./sectors";

// One translated name per sector. `satisfies Record<Sector, unknown>` makes a missing or unknown sector a type error.
const sectorNames = {
  ARTIFICIAL_INTELLIGENCE: t({ fr: "IA", en: "AI" }),
  ECOLOGY: t({ fr: "Écologie", en: "Ecology" }),
  FINANCE: t({ fr: "Finance", en: "Finance" }),
  SOFTWARE: t({ fr: "Logiciel", en: "Software" }),
  SPACE: t({ fr: "Spatial", en: "Space" }),
  HEALTHCARE: t({ fr: "Santé", en: "Healthcare" }),
  INDUSTRY: t({ fr: "Industrie", en: "Industry" }),
  CONSTRUCTION: t({ fr: "Construction", en: "Construction" }),
  ENERGY: t({ fr: "Énergie", en: "Energy" }),
  RESOURCES: t({ fr: "Ressources", en: "Resources" }),
  REAL_ESTATE: t({ fr: "Immobilier", en: "Real estate" }),
  HOSPITALITY: t({ fr: "Hôtellerie", en: "Hospitality" }),
  SOCIAL: t({ fr: "Social", en: "Social" }),
  NEW_TECHNOLOGIES: t({ fr: "Nouvelles technologies", en: "New technologies" }),
  EDUCATION: t({ fr: "Éducation", en: "Education" }),
  FOOD: t({ fr: "Alimentation", en: "Food" }),
  AGRICULTURE: t({ fr: "Agriculture", en: "Agriculture" }),
  SPORTS: t({ fr: "Sport", en: "Sports" }),
  MEDIA: t({ fr: "Médias", en: "Media" }),
  COMMUNICATIONS: t({ fr: "Communication", en: "Communications" }),
  CULTURE: t({ fr: "Culture", en: "Culture" }),
  ENTERTAINMENT: t({ fr: "Divertissement", en: "Entertainment" }),
  TRANSPORT: t({ fr: "Transport", en: "Transport" }),
  COMPUTER_HARDWARE: t({ fr: "Matériel informatique", en: "Computer hardware" }),
  SERVICES: t({ fr: "Services", en: "Services" }),
  CONSUMER_GOODS: t({ fr: "Biens de consommation", en: "Consumer goods" }),
  DISTRIBUTION: t({ fr: "Distribution", en: "Distribution" }),
  TELECOMMUNICATIONS: t({ fr: "Télécommunications", en: "Telecommunications" }),
  BIOTECHNOLOGY: t({ fr: "Biotechnologies", en: "Biotechnology" }),
  WEB3: t({ fr: "Web3", en: "Web3" }),
  LEGAL: t({ fr: "Juridique", en: "Legal" }),
  DEFENSE: t({ fr: "Défense", en: "Defense" }),
} satisfies Record<Sector, unknown>;

const sectorsContent = {
  key: "sectors",
  content: sectorNames,
} satisfies Dictionary;

export default sectorsContent;
