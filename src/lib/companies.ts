import "server-only";
import type { DeclaredLocales } from "intlayer";
import { CompanyStatus } from "@/components/company/company-status";
import type { Sector } from "@/components/sectors/sectors";

/** A company as the API returns it: the description is already in the requested language. */
export type Company = {
  id: string;
  name: string;
  description: string;
  sectors: Sector[];
  status: CompanyStatus;
  /** Background of the round logo (the company's brand colour). */
  logoColor: string;
};

type CompanyRecord = Omit<Company, "description"> & { description: Record<DeclaredLocales, string> };

// Sample data (the database schema is not ours to change). Doctolib is real and active;
// the other companies are fictional, so no "closed" or "sold" badge is shown on a real company.
// Order matters: the background shows them left 1-4, then right 1-4.
const COMPANIES: CompanyRecord[] = [
  {
    id: "kilowatt-and-co",
    name: "Kilowatt & Co",
    description: {
      fr: "Bornes de recharge rapide pour véhicules électriques dans les zones rurales",
      en: "Fast charging stations for electric vehicles in rural areas",
    },
    sectors: ["ENERGY", "TRANSPORT"],
    status: CompanyStatus.CLOSED,
    logoColor: "#E08A2E",
  },
  {
    id: "agrisonde",
    name: "Agrisonde",
    description: {
      fr: "Capteurs connectés qui aident les agriculteurs à réduire leur consommation d'eau",
      en: "Connected sensors that help farmers reduce their water use",
    },
    sectors: ["AGRICULTURE", "ECOLOGY", "NEW_TECHNOLOGIES"],
    status: CompanyStatus.ACTIVE,
    logoColor: "#2F9E5B",
  },
  {
    id: "clausia",
    name: "Clausia",
    description: {
      fr: "Assistant juridique qui analyse les contrats et signale les clauses à risque",
      en: "Legal assistant that reviews contracts and flags risky clauses",
    },
    sectors: ["LEGAL", "ARTIFICIAL_INTELLIGENCE", "SOFTWARE"],
    status: CompanyStatus.ACTIVE,
    logoColor: "#7A5CE0",
  },
  {
    id: "restokit",
    name: "Restokit",
    description: {
      fr: "Application de recettes qui transforme les restes du frigo en repas complets",
      en: "Recipe app that turns fridge leftovers into complete meals",
    },
    sectors: ["FOOD", "SOFTWARE"],
    status: CompanyStatus.ACQUIRED,
    logoColor: "#D9534F",
  },
  {
    id: "doctolib",
    name: "Doctolib",
    description: {
      fr: "Plateforme numérique facilitant la prise de rendez-vous médicaux et la gestion des consultations",
      en: "Digital platform that makes it easy to book medical appointments and manage consultations",
    },
    sectors: ["HEALTHCARE", "SOFTWARE", "ARTIFICIAL_INTELLIGENCE"],
    status: CompanyStatus.ACTIVE,
    logoColor: "#1479CD",
  },
  {
    id: "orbisylve",
    name: "Orbisylve",
    description: {
      fr: "Petits satellites d'observation pour suivre l'état des forêts en temps réel",
      en: "Small observation satellites that monitor the health of forests in real time",
    },
    sectors: ["SPACE", "ECOLOGY"],
    status: CompanyStatus.ACTIVE,
    logoColor: "#2D8FD5",
  },
  {
    id: "cargoulette",
    name: "Cargoulette",
    description: {
      fr: "Location de vélos cargo entre voisins pour les trajets du quotidien",
      en: "Neighbour-to-neighbour cargo bike rental for everyday trips",
    },
    sectors: ["TRANSPORT", "SOCIAL"],
    status: CompanyStatus.INACTIVE,
    logoColor: "#13A89E",
  },
  {
    id: "tresoria",
    name: "Trésoria",
    description: {
      fr: "Tableau de bord de trésorerie pour les indépendants et les petites entreprises",
      en: "Cash-flow dashboard for freelancers and small businesses",
    },
    sectors: ["FINANCE", "SOFTWARE"],
    status: CompanyStatus.ACTIVE,
    logoColor: "#C9A227",
  },
];

/** The companies with their description in the given language. */
export const getCompanies = (locale: DeclaredLocales): Company[] =>
  COMPANIES.map(({ description, ...company }) => ({ ...company, description: description[locale] }));
