# Guia de Integração Supabase - CRM Imobiliário (Estate Compass)

Este guia documenta o padrão de integração utilizado no frontend `front-crm-imob` para se comunicar com o backend do Supabase (`estate-compass`). Ele serve como instrução detalhada para que qualquer IA ou desenvolvedor possa replicar a mesma integração em outro frontend imobiliário (seja Next.js ou React/Vite, como o `paulo-corretor`).

---

## 1. Arquitetura Multitenant (Multi-empresa)

O sistema foi desenhado para ser dinamicamente configurado por empresa (Broker/Corretor).
Cada frontend é associado a uma empresa no banco de dados através de duas variáveis de ambiente:
- `COMPANY_ID` (UUID da empresa no Supabase)
- `COMPANY_EMAIL` (E-mail de cadastro da empresa no Supabase)

O frontend carrega as informações básicas da empresa (nome, logo, CRECI, CNPJ, telefone, links de redes sociais, configurações de marca e cores) a partir do banco e ajusta o layout, cabeçalho, rodapé e as cores de forma dinâmica. Todos os imóveis e empreendimentos são filtrados por esse `company_id`.

---

## 2. Variáveis de Ambiente (.env.local)

Dependendo do framework do frontend de destino, o prefixo das variáveis muda:

### Para Next.js:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mhmmgaqustdgschjnspc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obW1nYXF1c3RkZ3NjaGpuc3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDAyNjMsImV4cCI6MjA4ODExNjI2M30.uFl6_P3b-piTkeO4_StMoPpdXhY8NtC_hkb4LjaAzVw

# Usar APENAS UM dos dois abaixo para identificar a empresa dona deste site:
NEXT_PUBLIC_COMPANY_EMAIL=contato@pauloghisleni.com.br
# NEXT_PUBLIC_COMPANY_ID=seu-uuid-da-empresa
```

### Para Vite (React):
```env
VITE_SUPABASE_URL=https://mhmmgaqustdgschjnspc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obW1nYXF1c3RkZ3NjaGpuc3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDAyNjMsImV4cCI6MjA4ODExNjI2M30.uFl6_P3b-piTkeO4_StMoPpdXhY8NtC_hkb4LjaAzVw

# Identificador da empresa:
VITE_COMPANY_EMAIL=contato@pauloghisleni.com.br
# VITE_COMPANY_ID=seu-uuid-da-empresa
```
*Dica para Vite:* Para permitir o uso do prefixo `NEXT_PUBLIC_` sem alterar o `.env.local`, adicione no `vite.config.ts`:
```typescript
export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  // ... resto da config
})
```

---

## 3. Instalação e Inicialização do Supabase

### Passo 1: Instalar o SDK do Supabase
```bash
npm install @supabase/supabase-js
# ou usando yarn / bun
yarn add @supabase/supabase-js
bun add @supabase/supabase-js
```

### Passo 2: Criar o cliente Supabase (`lib/supabase.ts`)
Crie o arquivo em `src/lib/supabase.ts` (Vite) ou `lib/supabase.ts` (Next.js):
```typescript
import { createClient } from "@supabase/supabase-js";

// Suporte para Next.js (process.env) ou Vite (import.meta.env)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL)!;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 4. Tipagem de Dados (`lib/types.ts`)

Crie um arquivo contendo todas as interfaces de dados correspondentes ao banco do Supabase:

```typescript
export type PropertyType = "apartment" | "house" | "commercial" | "land" | "studio";
export type PropertyStatus = "available" | "sold" | "reserved" | "rented" | "maintenance";
export type DevelopmentStatus = "planning" | "construction" | "ready" | "sold-out";

export interface PropertyAddress {
  street?: string;
  number?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
}

export interface Property {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  type: PropertyType;
  status: PropertyStatus;
  price?: number;
  area?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parking_spaces?: number;
  address: PropertyAddress;
  images: string[];
  features?: Array<{ name: string } | string>;
  development_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentMilestone {
  date: string;
  title: string;
  completed: boolean;
}

export interface Development {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  status: DevelopmentStatus;
  total_units?: number;
  sold_units?: number;
  address: PropertyAddress;
  images: string[];
  milestones?: DevelopmentMilestone[];
  created_at: string;
}

export interface CompanyAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface CompanySettings {
  brand?: {
    colorPrimary?: string;
    colorSecondary?: string;
    colorBackground?: string;
    heroTagline?: string;
    heroSubtitle?: string;
    heroBgImage?: string;
    siteTitle?: string;
    siteDescription?: string;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };
  whatsapp?: string;
  creci?: string;
  cnpj?: string;
  workingHours?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: CompanyAddress;
  settings?: CompanySettings;
}

export interface LeadCreate {
  name: string;
  email?: string;
  phone?: string;
  source?: string; // "website"
  notes?: string;  // Mensagem livre + contexto do imóvel consultado
  company_id: string;
  property_id?: string;
  development_id?: string;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartamento",
  house: "Casa",
  land: "Terreno",
  commercial: "Comercial",
  studio: "Studio",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Disponível",
  sold: "Vendido",
  rented: "Alugado",
  reserved: "Reservado",
  maintenance: "Em manutenção",
};

export const DEVELOPMENT_STATUS_LABELS: Record<DevelopmentStatus, string> = {
  planning: "Em Planejamento",
  construction: "Em Construção",
  ready: "Pronto para Morar",
  "sold-out": "Esgotado",
};
```

---

## 5. Helpers de Formatação e WhatsApp

### Formatadores (`lib/formatters.ts` ou `src/lib/formatters.ts`)
```typescript
export function formatPrice(price?: number): string {
  if (!price) return "Consulte";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area?: number): string {
  if (!area) return "—";
  return `${area.toLocaleString("pt-BR")}m²`;
}

export function formatPhone(phone?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}

export function formatAddress(address?: { neighborhood?: string; city?: string; state?: string }): string {
  if (!address) return "";
  const parts = [address.neighborhood, address.city, address.state].filter(Boolean);
  return parts.join(", ");
}
```

### WhatsApp URL Builder (`lib/whatsapp.ts` ou `src/lib/whatsapp.ts`)
```typescript
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function propertyWhatsAppMessage(title: string): string {
  return `Olá! Vi o imóvel *${title}* no site e gostaria de mais informações.`;
}

export function developmentWhatsAppMessage(name: string): string {
  return `Olá! Tenho interesse no empreendimento *${name}*. Pode me dar mais informações?`;
}

export function generalWhatsAppMessage(): string {
  return "Olá! Gostaria de mais informações sobre seus imóveis.";
}
```

---

## 6. Provedor de Contexto da Empresa (`CompanyContext`)

Para evitar chamadas redundantes e prover as configurações da imobiliária globalmente, crie um context.

### Em um SPA React (Vite - Exemplo: `paulo-corretor`)
Carrega os dados via Supabase logo no mount do App:

```typescript
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/types";

const CompanyContext = createContext<Company | null>(null);

export function useCompany() {
  return useContext(CompanyContext);
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      const email = import.meta.env.VITE_COMPANY_EMAIL;
      const id = import.meta.env.VITE_COMPANY_ID;

      if (!email && !id) {
        console.error("Configure VITE_COMPANY_EMAIL ou VITE_COMPANY_ID no .env.local");
        setLoading(false);
        return;
      }

      let query = supabase
        .from("companies")
        .select("id, name, logo, phone, email, address, settings");

      const { data, error } = id
        ? await query.eq("id", id).single()
        : await query.eq("email", email!).single();

      if (error) {
        console.error("Erro ao buscar empresa:", error.message);
      } else if (data) {
        setCompany(data as Company);
        
        // Aplicação dinâmica das cores de marca no document element
        const brand = data.settings?.brand;
        if (brand?.colorPrimary) {
          document.documentElement.style.setProperty("--color-primary", brand.colorPrimary);
        }
        if (brand?.colorSecondary) {
          document.documentElement.style.setProperty("--color-secondary", brand.colorSecondary);
        }
        if (brand?.siteTitle) {
          document.title = brand.siteTitle;
        }
      }
      setLoading(false);
    }

    loadCompany();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <CompanyContext.Provider value={company}>
      {children}
    </CompanyContext.Provider>
  );
}
```
*Envolva a árvore de componentes no `main.tsx` ou `App.tsx` com `<CompanyProvider>`.*

---

## 7. Consultas no Banco de Dados (Supabase Query Patterns)

Todos os selects devem filtrar obrigatoriamente por `company_id`.

### A. Listagem de Imóveis (com filtros opcionais)
```typescript
import { supabase } from "@/lib/supabase";
import type { Property } from "@/lib/types";

async function fetchProperties(companyId: string, filters: {
  tipo?: string;
  quartos?: number;
  precoMin?: number;
  precoMax?: number;
  bairroCidade?: string;
  ordem?: string;
}) {
  let query = supabase
    .from("properties")
    .select("id, title, type, status, price, area, bedrooms, bathrooms, parking_spaces, address, images")
    .eq("company_id", companyId)
    // Apenas imóveis ativos no site
    .in("status", ["available", "reserved", "rented"]);

  // Filtros dinâmicos
  if (filters.tipo) {
    query = query.eq("type", filters.tipo);
  }
  if (filters.quartos) {
    query = query.gte("bedrooms", filters.quartos);
  }
  if (filters.precoMin) {
    query = query.gte("price", filters.precoMin);
  }
  if (filters.precoMax) {
    query = query.lte("price", filters.precoMax);
  }
  if (filters.bairroCidade) {
    // Busca por texto parcial no bairro ou cidade
    query = query.or(`address->>neighborhood.ilike.%${filters.bairroCidade}%,address->>city.ilike.%${filters.bairroCidade}%`);
  }

  // Ordenação
  switch (filters.ordem) {
    case "preco_asc":
      query = query.order("price", { ascending: true });
      break;
    case "preco_desc":
      query = query.order("price", { ascending: false });
      break;
    case "area_desc":
      query = query.order("area", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Property[];
}
```

### B. Detalhes de um Imóvel Específico
```typescript
async function fetchPropertyById(id: string, companyId: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (error) return null;
  return data as Property;
}
```

### C. Listagem de Empreendimentos (Lançamentos)
```typescript
async function fetchDevelopments(companyId: string) {
  const { data, error } = await supabase
    .from("developments")
    .select("id, name, status, total_units, sold_units, address, images, milestones")
    .eq("company_id", companyId)
    .neq("status", "sold-out") // Oculta empreendimentos 100% vendidos da home
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

---

## 8. Captação de Leads (Formulários de Contato)

Ao enviar o formulário de contato do site, insira o lead na tabela `leads` do Supabase:

```typescript
import { supabase } from "@/lib/supabase";
import type { LeadCreate } from "@/lib/types";

async function submitLead(name: string, email: string, phone: string, message: string, companyId: string, propertyId?: string) {
  // Construa notas informativas com base no contexto (Ex: se ele veio da página de um imóvel)
  const notes = [
    propertyId ? `Interessado no imóvel ID: ${propertyId}` : "",
    message
  ].filter(Boolean).join("\n");

  const lead: LeadCreate = {
    name,
    email,
    phone,
    source: "website",
    notes: notes || undefined,
    company_id: companyId,
    property_id: propertyId
  };

  const { error } = await supabase
    .from("leads")
    .insert(lead);

  if (error) {
    throw new Error("Falha ao salvar lead: " + error.message);
  }
}
```

---

## 9. Roteamento de Imagens e Configurações Adicionais

Como as imagens dos imóveis são salvas remotamente (usando ImageKit ou buckets do Supabase), se você estiver no Next.js, atualize seu `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "ik.imagekit.io" },
    { protocol: "https", hostname: "mhmmgaqustdgschjnspc.supabase.co" },
  ],
}
```

---

## 10. Políticas de RLS (Row Level Security) no Supabase

As tabelas no Supabase precisam estar configuradas com as seguintes políticas de segurança (SQL) para aceitar acessos públicos anônimos:

```sql
-- 1. Permitir leitura pública de imóveis (somente ativos)
CREATE POLICY "anon_read_properties" ON properties
  FOR SELECT TO anon
  USING (status IN ('available', 'reserved', 'rented'));

-- 2. Permitir leitura pública de empreendimentos
CREATE POLICY "anon_read_developments" ON developments
  FOR SELECT TO anon
  USING (true);

-- 3. Permitir leitura pública dos dados da imobiliária
CREATE POLICY "anon_read_companies" ON companies
  FOR SELECT TO anon
  USING (true);

-- 4. Permitir que o site crie leads anonimamente (inserir formulário de contato)
CREATE POLICY "anon_insert_leads" ON leads
  FOR INSERT TO anon
  WITH CHECK (source = 'website');
```
