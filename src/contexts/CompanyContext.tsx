import React, { createContext, useContext, useEffect } from "react";
import type { Company } from "@/lib/types";

const CompanyContext = createContext<Company | null>(null);

export function useCompany(): Company {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}

/** Dados locais da SmartImob — API temporariamente ignorada */
const DEFAULT_COMPANY: Company = {
  id: "37fcee72-7db3-4227-95cc-1d3bd5bd1224",
  name: "Imobiliária SmartImob",
  email: "contato@imoveissmart.com.br",
  phone: "48996764446",
  logo: "/logo.png",
  address: {
    street: "R. Atanásio Bernardes",
    number: "274",
    complement: "Sala 01",
    neighborhood: "Centro",
    city: "Tijucas",
    state: "SC",
    zipCode: "88200-000",
  },
  settings: {
    creci: "7066-J, 7841-J",
    whatsapp: "5548996764446",
    socialMedia: {},
    brand: {
      colorPrimary: "358 78% 50%",
      colorSecondary: "0 0% 55%",
      siteTitle: "Imobiliária SmartImob | Assessoria Imobiliária",
      siteDescription:
        "A sua imobiliária no vale do rio Tijucas, Porto Belo, Itapema e Balneário Camboriú.",
    },
  },
};

function applyBrandSettings(comp: Company) {
  const brand = comp.settings?.brand;
  if (brand?.colorPrimary) {
    document.documentElement.style.setProperty("--primary", brand.colorPrimary);
  }
  if (brand?.colorSecondary) {
    document.documentElement.style.setProperty("--secondary", brand.colorSecondary);
  }
  if (brand?.siteTitle) {
    document.title = brand.siteTitle;
  }
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyBrandSettings(DEFAULT_COMPANY);
  }, []);

  return (
    <CompanyContext.Provider value={DEFAULT_COMPANY}>
      {children}
    </CompanyContext.Provider>
  );
}
