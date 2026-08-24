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
  area_label?: string;
  bedrooms?: number;
  bedrooms_label?: string;
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
  complement?: string;
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

export interface Imovel {
  id: string;
  nome: string;
  tipo: string;
  construtora: string;
  imagens: string[];
  descricao: string;
  preco: string;
  detalhes: string[];
  metragem?: string;
  dormitorios?: string | number;
  vagas?: string | number;
  localizacao?: string;
  isDevelopment?: boolean;
  finalidade?: "compra" | "locacao" | "ambos";
  valorNumerico?: number;
  destaque?: boolean;
}

import { formatPrice } from "./formatters";

export function mapPropertyToImovel(prop: Property): Imovel {
  const priceNum = prop.price ? Number(prop.price) : undefined;
  return {
    id: prop.id,
    nome: prop.title,
    tipo: PROPERTY_TYPE_LABELS[prop.type] || "Apartamento",
    construtora: "", // Will be filled or default
    imagens: prop.images && prop.images.length > 0 ? prop.images : ["/slide/vul1.jpg"],
    descricao: prop.description || "",
    preco: priceNum && priceNum > 0 ? formatPrice(priceNum) : "Consulte",
    detalhes: Array.isArray(prop.features)
      ? prop.features.map((f) => (typeof f === "string" ? f : f.name))
      : [],
    metragem: prop.area_label 
      ? (prop.area_label.includes("m²") ? prop.area_label : `${prop.area_label} m²`)
      : (prop.area ? `${prop.area} m²` : undefined),
    dormitorios: prop.bedrooms_label || (prop.bedrooms ? String(prop.bedrooms) : undefined),
    vagas: prop.parking_spaces ? String(prop.parking_spaces) : undefined,
    localizacao: prop.address ? `${prop.address.city}/${prop.address.state}` : "Itapema/SC",
    isDevelopment: false,
    finalidade: "compra",
    valorNumerico: priceNum && priceNum > 0 ? priceNum : undefined,
    destaque: true,
  };
}

export function mapDevelopmentToImovel(dev: Development, devProps: Property[] = []): Imovel {
  let tipo = "Empreendimento";
  if (devProps.length > 0) {
    const types = Array.from(new Set(devProps.map(p => PROPERTY_TYPE_LABELS[p.type] || "Apartamento")));
    tipo = types.join(" / ");
  }

  let preco = "Consulte";
  let metragem: string | undefined = undefined;
  let dormitorios: string | undefined = undefined;
  let vagas: string | undefined = undefined;
  let minPrice: number | undefined = undefined;

  if (devProps.length > 0) {
    const prices = devProps.map(p => Number(p.price || 0)).filter(p => p > 0);
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      preco = `A partir de ${formatPrice(minPrice)}`;
    }
    
    const areas = devProps.map(p => Number(p.area || 0)).filter(a => a > 0);
    if (areas.length > 0) {
      const minArea = Math.min(...areas);
      const maxArea = Math.max(...areas);
      metragem = minArea === maxArea ? `${minArea} m²` : `${minArea} a ${maxArea} m²`;
    }

    const beds = devProps.map(p => Number(p.bedrooms || 0)).filter(b => b > 0);
    if (beds.length > 0) {
      const minBed = Math.min(...beds);
      const maxBed = Math.max(...beds);
      dormitorios = minBed === maxBed ? String(minBed) : `${minBed} a ${maxBed}`;
    }

    const garages = devProps.map(p => Number(p.parking_spaces || 0)).filter(g => g > 0);
    if (garages.length > 0) {
      const minGar = Math.min(...garages);
      const maxGar = Math.max(...garages);
      vagas = minGar === maxGar ? String(minGar) : `${minGar} a ${maxGar}`;
    }
  }

  return {
    id: dev.id,
    nome: dev.name,
    tipo,
    construtora: "",
    imagens: dev.images && dev.images.length > 0 ? dev.images : ["/slide/vul1.jpg"],
    descricao: dev.description || "",
    preco,
    detalhes: [],
    metragem,
    dormitorios,
    vagas,
    localizacao: dev.address ? `${dev.address.city}/${dev.address.state}` : "Itapema/SC",
    isDevelopment: true,
    finalidade: "compra",
    valorNumerico: minPrice,
    destaque: true,
  };
}
