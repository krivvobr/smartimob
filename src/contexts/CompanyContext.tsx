import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/types";

const CompanyContext = createContext<Company | null>(null);

export function useCompany(): Company {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}

/** Dados locais da SmartImob — usados como fallback de exibição enquanto a empresa não é carregada */
const DEFAULT_COMPANY: Company = {
  id: "",
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
  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY);

  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      const email = import.meta.env.NEXT_PUBLIC_COMPANY_EMAIL || import.meta.env.VITE_COMPANY_EMAIL;
      const id = import.meta.env.NEXT_PUBLIC_COMPANY_ID || import.meta.env.VITE_COMPANY_ID;

      if (!email && !id) {
        console.warn("Configure NEXT_PUBLIC_COMPANY_EMAIL ou NEXT_PUBLIC_COMPANY_ID no .env.local");
        return;
      }

      let query = supabase
        .from("companies")
        .select("id, name, logo, phone, email, address, settings");

      const { data, error } = id
        ? await query.eq("id", id).maybeSingle()
        : await query.eq("email", email!).maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Erro ao buscar empresa:", error.message);
        return;
      }
      if (!data) {
        console.warn(`Empresa não encontrada (email=${email}, id=${id}). Verifique o .env.local.`);
        return;
      }

      setCompany(data as Company);
    }

    loadCompany();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyBrandSettings(company);
  }, [company]);

  return (
    <CompanyContext.Provider value={company}>
      {children}
    </CompanyContext.Provider>
  );
}
