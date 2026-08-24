import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building2, DollarSign, RotateCcw, ChevronDown } from "lucide-react";

export interface SearchFilters {
  finalidade: "compra" | "locacao";
  cidade: string;
  tipo: string;
  faixaValor: string;
}

interface HomeSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  availableCities?: string[];
  availableTypes?: string[];
  initialFilters?: SearchFilters;
  isFiltered?: boolean;
  totalResults?: number;
}

const DEFAULT_CITIES = [
  "Itapema",
  "Porto Belo",
  "Balneário Camboriú",
  "Tijucas",
  "Bombinhas",
  "Itajaí",
];

const DEFAULT_TYPES = [
  "Apartamento",
  "Penthouse",
  "Cobertura Duplex",
  "Casa",
  "Studio",
  "Comercial",
  "Terreno",
];

const PRICE_RANGES_COMPRA = [
  { label: "Qualquer Valor", value: "" },
  { label: "Até R$ 1.500.000", value: "0-1500000" },
  { label: "R$ 1.500.000 a R$ 3.000.000", value: "1500000-3000000" },
  { label: "R$ 3.000.000 a R$ 6.000.000", value: "3000000-6000000" },
  { label: "R$ 6.000.000 a R$ 10.000.000", value: "6000000-10000000" },
  { label: "Acima de R$ 10.000.000", value: "10000000-999999999" },
];

const PRICE_RANGES_LOCACAO = [
  { label: "Qualquer Valor", value: "" },
  { label: "Até R$ 3.500 / mês", value: "0-3500" },
  { label: "R$ 3.500 a R$ 7.000 / mês", value: "3500-7000" },
  { label: "R$ 7.000 a R$ 15.000 / mês", value: "7000-15000" },
  { label: "Acima de R$ 15.000 / mês", value: "15000-999999999" },
];

export const HomeSearch: React.FC<HomeSearchProps> = ({
  onSearch,
  onClear,
  availableCities = [],
  availableTypes = [],
  initialFilters = {
    finalidade: "compra",
    cidade: "",
    tipo: "",
    faixaValor: "",
  },
  isFiltered = false,
  totalResults,
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Combine unique cities
  const cities = Array.from(
    new Set([...availableCities.filter(Boolean), ...DEFAULT_CITIES])
  );

  // Combine unique types
  const types = Array.from(
    new Set([...availableTypes.filter(Boolean), ...DEFAULT_TYPES])
  );

  const priceRanges =
    filters.finalidade === "locacao" ? PRICE_RANGES_LOCACAO : PRICE_RANGES_COMPRA;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const cleared: SearchFilters = {
      finalidade: "compra",
      cidade: "",
      tipo: "",
      faixaValor: "",
    };
    setFilters(cleared);
    onClear();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative z-30">
      <div className="bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_0_1px_rgba(227,30,36,0.15)] p-4 sm:p-5 md:p-6">
        {/* Header with Purpose Tabs (Compra / Locação) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = { ...filters, finalidade: "compra" as const };
                setFilters(next);
                onSearch(next);
              }}
              className={`relative px-5 py-2 font-display text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${
                filters.finalidade === "compra"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Comprar
            </button>
            <button
              type="button"
              onClick={() => {
                const next = { ...filters, finalidade: "locacao" as const };
                setFilters(next);
                onSearch(next);
              }}
              className={`relative px-5 py-2 font-display text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${
                filters.finalidade === "locacao"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Locação
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-body text-xs text-white/50 tracking-wider uppercase">
              Busca Inteligente
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-body tracking-wider transition-colors"
                title="Limpar todos os filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <form onSubmit={handleSubmit} className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-end">
            {/* Cidade */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-[11px] tracking-widest uppercase text-white/70 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                Cidade
              </label>
              <div className="relative">
                <select
                  value={filters.cidade}
                  onChange={(e) => {
                    const next = { ...filters, cidade: e.target.value };
                    setFilters(next);
                  }}
                  className="w-full bg-[#121212] border border-white/15 text-white px-3.5 py-3 text-sm appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer rounded-none"
                >
                  <option value="" className="bg-[#1a1a1a] text-white">
                    Todas as Cidades
                  </option>
                  {cities.map((city) => (
                    <option
                      key={city}
                      value={city}
                      className="bg-[#1a1a1a] text-white"
                    >
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tipo de Imóvel */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-[11px] tracking-widest uppercase text-white/70 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                Tipo de Imóvel
              </label>
              <div className="relative">
                <select
                  value={filters.tipo}
                  onChange={(e) => {
                    const next = { ...filters, tipo: e.target.value };
                    setFilters(next);
                  }}
                  className="w-full bg-[#121212] border border-white/15 text-white px-3.5 py-3 text-sm appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer rounded-none"
                >
                  <option value="" className="bg-[#1a1a1a] text-white">
                    Todos os Tipos
                  </option>
                  {types.map((t) => (
                    <option key={t} value={t} className="bg-[#1a1a1a] text-white">
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Valor */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-[11px] tracking-widest uppercase text-white/70 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                Faixa de Valor
              </label>
              <div className="relative">
                <select
                  value={filters.faixaValor}
                  onChange={(e) => {
                    const next = { ...filters, faixaValor: e.target.value };
                    setFilters(next);
                  }}
                  className="w-full bg-[#121212] border border-white/15 text-white px-3.5 py-3 text-sm appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer rounded-none"
                >
                  {priceRanges.map((range) => (
                    <option
                      key={range.value}
                      value={range.value}
                      className="bg-[#1a1a1a] text-white"
                    >
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Botão Buscar */}
            <div className="flex flex-col">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#b71c1c] text-white py-3 px-5 font-display text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 group"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Buscar Imóveis</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Result / Status line if search is active */}
        {isFiltered && totalResults !== undefined && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-body text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>
                {totalResults === 0
                  ? "Nenhum imóvel encontrado com esses filtros"
                  : `${totalResults} ${totalResults === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filters.cidade && (
                <span className="bg-white/10 px-2.5 py-1 text-[11px] text-white/90">
                  Cidade: <strong>{filters.cidade}</strong>
                </span>
              )}
              {filters.tipo && (
                <span className="bg-white/10 px-2.5 py-1 text-[11px] text-white/90">
                  Tipo: <strong>{filters.tipo}</strong>
                </span>
              )}
              {filters.faixaValor && (
                <span className="bg-white/10 px-2.5 py-1 text-[11px] text-white/90">
                  Valor:{" "}
                  <strong>
                    {priceRanges.find((p) => p.value === filters.faixaValor)?.label}
                  </strong>
                </span>
              )}
              <span className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 text-[11px]">
                {filters.finalidade === "locacao" ? "Locação" : "Compra"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
