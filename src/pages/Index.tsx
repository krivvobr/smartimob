import { useState, useEffect } from "react";
import { Shield, TrendingUp, Sparkles, SlidersHorizontal, ArrowRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { imoveis as staticImoveis } from "@/data/imoveis";
import { ImovelCard } from "@/components/imoveis/ImovelCard";
import { ImoveisAluguelDestaque } from "@/components/home/ImoveisAluguelDestaque";
import { HomeSearch, SearchFilters } from "@/components/home/HomeSearch";
import fachadaImg from "@/assets/fachada-smartimob.jpg";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/lib/supabase";
import { mapPropertyToImovel, mapDevelopmentToImovel, Imovel, Development, DEVELOPMENT_STATUS_LABELS } from "@/lib/types";
import { buildWhatsAppUrl, generalWhatsAppMessage } from "@/lib/whatsapp";
import { useNavigate } from "react-router-dom";

const heroSlides = [
  "/slide/vul1.jpg",
  "/slide/vul2.jpg",
  "/slide/vul3.jpg",
  "/slide/vul4.jpg",
  "/slide/vul5.jpg",
  "/slide/vul6.jpg",
  "/slide/vul7.jpg",
];

const getLayoutSettings = (index: number, total: number) => {
  if (total === 1) {
    return {
      gridClass: "md:col-span-3 md:row-span-2 relative overflow-hidden group cursor-pointer h-80 md:h-auto",
      textSize: "text-3xl md:text-5xl",
      padding: "p-8 md:p-10",
      delay: 0
    };
  }
  if (total === 2) {
    if (index === 0) {
      return {
        gridClass: "md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer h-80 md:h-auto",
        textSize: "text-3xl md:text-5xl",
        padding: "p-8 md:p-10",
        delay: 0
      };
    } else {
      return {
        gridClass: "md:col-span-1 md:row-span-2 relative overflow-hidden group cursor-pointer h-80 md:h-auto",
        textSize: "text-2xl md:text-4xl",
        padding: "p-8 md:p-10",
        delay: 0.2
      };
    }
  }
  // total >= 3
  if (index === 0) {
    return {
      gridClass: "md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer h-80 md:h-auto",
      textSize: "text-3xl md:text-5xl",
      padding: "p-8 md:p-10",
      delay: 0
    };
  } else if (index === 1) {
    return {
      gridClass: "relative overflow-hidden group cursor-pointer h-56 md:h-auto",
      textSize: "text-xl md:text-2xl",
      padding: "p-5 md:p-6",
      delay: 0.15
    };
  } else {
    return {
      gridClass: "relative overflow-hidden group cursor-pointer h-56 md:h-auto",
      textSize: "text-xl md:text-2xl",
      padding: "p-5 md:p-6",
      delay: 0.3
    };
  }
};

const Index = () => {
  const company = useCompany();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [mappedDevelopments, setMappedDevelopments] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    finalidade: "compra",
    cidade: "",
    tipo: "",
    faixaValor: "",
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showAllProperties, setShowAllProperties] = useState(false);

  useEffect(() => {
    // Preload all slide images so transitions don't flash white
    heroSlides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadProperties() {
      if (!company?.id) return;
      try {
        // Fetch developments (status != sold-out)
        const { data: developmentsData, error: devError } = await supabase
          .from("developments")
          .select("*")
          .eq("company_id", company.id)
          .neq("status", "sold-out");

        if (devError) throw devError;
        setDevelopments(developmentsData || []);

        // Fetch properties (status == available)
        const { data: propertiesData, error: propError } = await supabase
          .from("properties")
          .select("*")
          .eq("company_id", company.id)
          .eq("status", "available");

        if (propError) throw propError;

        const mappedProps: Imovel[] = [];

        // Map all properties
        if (propertiesData && propertiesData.length > 0) {
          propertiesData.forEach((prop) => {
            const parentDev = prop.development_id && developmentsData
              ? developmentsData.find((d) => d.id === prop.development_id)
              : undefined;

            const mapped = mapPropertyToImovel(prop);
            if (parentDev) {
              const city = prop.address?.city || parentDev.address?.city;
              const state = prop.address?.state || parentDev.address?.state;
              if (city && state) {
                mapped.localizacao = `${city}/${state}`;
              }
              mapped.construtora = parentDev.name;
            }
            mappedProps.push(mapped);
          });
        }

        if (mappedProps.length > 0) {
          setProperties(mappedProps);
        } else {
          setProperties(staticImoveis);
        }

        // Map developments to Imovel objects for the portfolio section
        const mappedDevs: Imovel[] = [];
        if (developmentsData && developmentsData.length > 0) {
          developmentsData.forEach((dev) => {
            const devProps = propertiesData
              ? propertiesData.filter((p) => p.development_id === dev.id)
              : [];
            mappedDevs.push(mapDevelopmentToImovel(dev, devProps));
          });
        }
        setMappedDevelopments(mappedDevs);
      } catch (err) {
        console.error("Error loading properties/developments:", err);
        setProperties(staticImoveis);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [company?.id]);

  const getDevelopmentCategory = (dev: Development): "apartamento" | "penthouse" | "cobertura" | "outro" => {
    const nameLower = dev.name.toLowerCase();
    const descLower = (dev.description || "").toLowerCase();
    
    if (nameLower.includes("penthouse") || descLower.includes("penthouse")) {
      return "penthouse";
    }
    if (nameLower.includes("cobertura") || nameLower.includes("duplex") || descLower.includes("cobertura") || descLower.includes("duplex")) {
      return "cobertura";
    }
    return "apartamento";
  };

  // Development counts for Explore por Tipo section
  const devApartmentCount = developments.length > 0
    ? developments.filter(d => getDevelopmentCategory(d) === "apartamento").length
    : 8;
  const devPenthouseCount = developments.length > 0
    ? developments.filter(d => getDevelopmentCategory(d) === "penthouse").length
    : 1;
  const devDuplexCount = developments.length > 0
    ? developments.filter(d => getDevelopmentCategory(d) === "cobertura").length
    : 1;

  const displayDevs = mappedDevelopments.slice(0, 3);

  // Available filters extracted dynamically
  const availableCities = Array.from(
    new Set(
      properties
        .map((p) => {
          if (!p.localizacao) return null;
          const parts = p.localizacao.split("/");
          return parts[0]?.trim();
        })
        .filter((c): c is string => Boolean(c))
    )
  );

  const availableTypes = Array.from(
    new Set(properties.map((p) => p.tipo).filter(Boolean))
  );

  // Filter properties according to search filters
  const filteredProperties = properties.filter((prop) => {
    if (!isSearchActive) return true;

    // Finalidade check
    if (searchFilters.finalidade) {
      if (prop.finalidade && prop.finalidade !== "ambos" && prop.finalidade !== searchFilters.finalidade) {
        return false;
      }
    }

    // Cidade check
    if (searchFilters.cidade) {
      const propLoc = (prop.localizacao || "").toLowerCase();
      const filterCity = searchFilters.cidade.toLowerCase();
      if (!propLoc.includes(filterCity)) {
        return false;
      }
    }

    // Tipo check
    if (searchFilters.tipo) {
      const propType = (prop.tipo || "").toLowerCase();
      const filterType = searchFilters.tipo.toLowerCase();
      if (!propType.includes(filterType) && !filterType.includes(propType)) {
        return false;
      }
    }

    // Valor check
    if (searchFilters.faixaValor) {
      const [minStr, maxStr] = searchFilters.faixaValor.split("-");
      const min = Number(minStr) || 0;
      const max = Number(maxStr) || Infinity;

      let val = prop.valorNumerico;
      if (!val && prop.preco) {
        const numericOnly = prop.preco.replace(/\D/g, "");
        if (numericOnly) val = Number(numericOnly);
      }

      if (val !== undefined && val !== null && val > 0) {
        if (val < min || val > max) return false;
      }
    }

    return true;
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    const hasFilterApplied = Boolean(
      filters.cidade ||
      filters.tipo ||
      filters.faixaValor ||
      filters.finalidade === "locacao"
    );
    setIsSearchActive(hasFilterApplied);
    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearSearch = () => {
    setSearchFilters({
      finalidade: "compra",
      cidade: "",
      tipo: "",
      faixaValor: "",
    });
    setIsSearchActive(false);
  };

  // Determine which properties to render:
  // When no search is active: default to 3 featured properties (or all if toggled)
  // When search is active: show all filtered results
  const displayedProperties = isSearchActive
    ? filteredProperties
    : showAllProperties
    ? properties
    : properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-secondary selection:text-white">
      <Navbar />

      {/* Hero Section — Reduced height for instant search visibility */}
      <section className="relative min-h-[48vh] md:min-h-[54vh] max-h-[520px] flex items-center justify-center overflow-hidden bg-foreground pt-16 md:pt-20">
        {/* Carousel Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlide]}
              alt="Imóvel de luxo"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-foreground/55" />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Dots */}
        <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-300 ${i === currentSlide ? "bg-primary w-6" : "bg-white/40 w-2"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Center Content Box — Compact Luxury */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 bg-foreground/65 backdrop-blur-md px-6 py-5 md:px-10 md:py-6 border border-primary/40 flex flex-col items-center text-center shadow-2xl mx-4 mb-10 md:mb-14"
        >
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-white mb-1.5 tracking-wider uppercase">
            Imobiliária SmartImob
          </h1>
          <h2 className="font-body text-[9px] sm:text-xs tracking-[0.25em] uppercase text-secondary font-medium">
            Assessoria Imobiliária de Alto Padrão
          </h2>
        </motion.div>
      </section>

      {/* Floating Modern Search Bar Section — Elevated position */}
      <section className="relative -mt-16 sm:-mt-20 md:-mt-20 z-30 mb-8 sm:mb-12">
        <HomeSearch
          onSearch={handleSearch}
          onClear={handleClearSearch}
          availableCities={availableCities}
          availableTypes={availableTypes}
          initialFilters={searchFilters}
          isFiltered={isSearchActive}
          totalResults={isSearchActive ? filteredProperties.length : undefined}
        />
      </section>

      {/* Portfólio Grid — Imóveis em Destaque */}
      <section id="imoveis" className="py-16 md:py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-body text-xs tracking-[0.3em] uppercase text-secondary font-medium block mb-2"
              >
                {isSearchActive ? "Filtro Aplicado" : "Seleção de Imóveis"}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-display text-3xl md:text-4xl text-foreground uppercase tracking-widest flex items-center gap-3"
              >
                {isSearchActive ? "Resultados da Busca" : "Imóveis em Destaque"}
              </motion.h2>
            </div>

            {/* Actions / Filter Info */}
            <div className="flex items-center gap-4">
              {isSearchActive && (
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border-b border-border pb-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ver Destaques
                </button>
              )}
              {!isSearchActive && properties.length > 3 && (
                <button
                  onClick={() => setShowAllProperties((prev) => !prev)}
                  className="inline-flex items-center gap-2 border border-foreground/30 hover:border-primary text-foreground hover:text-primary px-5 py-2.5 font-body text-xs tracking-widest uppercase transition-all duration-300"
                >
                  {showAllProperties ? "Ver apenas os 3 destaques" : `Ver todos os imóveis (${properties.length})`}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted border border-border/40 aspect-[4/3]" />
              ))
            ) : displayedProperties.length > 0 ? (
              displayedProperties.map((imovel, index) => (
                <ImovelCard
                  key={imovel.id}
                  imovel={imovel}
                  index={index}
                  featured={!isSearchActive}
                />
              ))
            ) : (
              <div className="col-span-full py-16 px-6 text-center bg-muted/40 border border-dashed border-border rounded-none">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 mx-auto bg-primary/10 flex items-center justify-center text-primary">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl uppercase tracking-wider text-foreground">
                    Nenhum imóvel encontrado
                  </h3>
                  <p className="font-body text-sm text-muted-foreground font-light leading-relaxed">
                    Não encontramos imóveis disponíveis para os critérios selecionados. Tente ajustar os filtros ou consulte nossa equipe para opções sob medida.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                    <button
                      onClick={handleClearSearch}
                      className="bg-foreground text-white hover:bg-primary px-6 py-2.5 font-body text-xs tracking-widest uppercase transition-colors"
                    >
                      Limpar Filtros
                    </button>
                    <a
                      href={buildWhatsAppUrl(company.settings?.whatsapp || company.phone || "48996764446", generalWhatsAppMessage())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-2.5 font-body text-xs tracking-widest uppercase transition-colors"
                    >
                      Falar com Consultor
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Toggle Button if not active search */}
          {!isSearchActive && properties.length > 3 && !showAllProperties && (
            <div className="mt-14 text-center">
              <button
                onClick={() => setShowAllProperties(true)}
                className="inline-flex items-center gap-3 border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3.5 font-body text-xs tracking-widest uppercase transition-all duration-300 shadow-sm"
              >
                <span>Explorar Todos os Imóveis ({properties.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Destaque de Imóveis para Alugar */}
      {!isSearchActive && (
        <ImoveisAluguelDestaque
          imoveis={properties}
          onSelectLocacaoFilter={() => {
            handleSearch({
              ...searchFilters,
              finalidade: "locacao",
            });
          }}
        />
      )}

      {/* Explore por Tipo / Empreendimentos */}
      <section className="py-24 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <span className="font-body text-xs tracking-[0.3em] uppercase text-secondary font-medium block mb-3">Portfólio Exclusivo</span>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-widest">
              {displayDevs.length > 0 ? "Empreendimentos Exclusivos" : "Explore por Tipo"}
            </h2>
          </motion.div>

          {/* Grid assimétrico */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[288px_288px] gap-3">
            {displayDevs.length > 0 ? (
              displayDevs.map((devImovel, index) => {
                const layout = getLayoutSettings(index, displayDevs.length);
                const rawDev = developments.find(d => d.id === devImovel.id);
                const statusLabel = rawDev ? DEVELOPMENT_STATUS_LABELS[rawDev.status] : "";
                const capa = devImovel.imagens && devImovel.imagens.length > 0 ? devImovel.imagens[0] : "/placeholder.jpg";

                return (
                  <motion.div
                    key={devImovel.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: layout.delay }}
                    className={layout.gridClass}
                    onClick={() => navigate(`/imovel/${devImovel.id}`)}
                  >
                    <img
                      src={capa}
                      alt={devImovel.nome}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/slide/vul1.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />
                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <span className="font-body text-[10px] tracking-[0.25em] uppercase text-secondary/70 block mb-2">
                        {statusLabel || "Empreendimento"}
                      </span>
                      <h3 className={`font-display ${layout.textSize} text-white uppercase tracking-widest mb-3 leading-none`}>
                        {devImovel.nome}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-secondary block" />
                        <span className="font-body text-xs md:text-sm text-white/50 tracking-[0.15em] line-clamp-1">
                          {devImovel.preco} • {devImovel.localizacao}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-5 right-5 w-8 h-8 border-t border-r border-secondary/60 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute bottom-5 left-5 w-8 h-8 border-b border-l border-secondary/30 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75" />
                  </motion.div>
                );
              })
            ) : (
              // Fallback
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer h-80 md:h-auto"
                  onClick={() => {
                    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <img
                    src="/imoveis/maison-laduree/fachada.jpg"
                    alt="Apartamento"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                    <span className="font-body text-[10px] tracking-[0.25em] uppercase text-secondary/70 block mb-2">Categoria</span>
                    <h3 className="font-display text-3xl md:text-5xl text-white uppercase tracking-widest mb-3 leading-none">Apartamento</h3>
                    <div className="flex items-center gap-3">
                      <span className="h-[1px] w-8 bg-secondary block" />
                      <span className="font-body text-sm text-white/50 tracking-[0.15em]">{devApartmentCount} {devApartmentCount === 1 ? 'Empreendimento' : 'Empreendimentos'}</span>
                    </div>
                  </div>
                  <div className="absolute top-5 right-5 w-8 h-8 border-t border-r border-secondary/60 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute bottom-5 left-5 w-8 h-8 border-b border-l border-secondary/30 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className="relative overflow-hidden group cursor-pointer h-56 md:h-auto"
                  onClick={() => {
                    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <img
                    src="/imoveis/lejardim/fachada.png"
                    alt="Penthouse"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <span className="font-body text-[9px] tracking-[0.25em] uppercase text-secondary/70 block mb-1">Categoria</span>
                    <h3 className="font-display text-xl md:text-2xl text-white uppercase tracking-widest mb-2 leading-none">Penthouse</h3>
                    <div className="flex items-center gap-2">
                      <span className="h-[1px] w-5 bg-secondary block" />
                      <span className="font-body text-xs text-white/50 tracking-[0.12em]">{devPenthouseCount} {devPenthouseCount === 1 ? 'Empreendimento' : 'Empreendimentos'}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-secondary/60 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="relative overflow-hidden group cursor-pointer h-56 md:h-auto"
                  onClick={() => {
                    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <img
                    src="/imoveis/elizabeth-ii/GE_E_FACHADA_DIURNA_AVENIDA_EF_web.jpg"
                    alt="Cobertura Duplex"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <span className="font-body text-[9px] tracking-[0.25em] uppercase text-secondary/70 block mb-1">Categoria</span>
                    <h3 className="font-display text-xl md:text-2xl text-white uppercase tracking-widest mb-2 leading-none">Cobertura Duplex</h3>
                    <div className="flex items-center gap-2">
                      <span className="h-[1px] w-5 bg-secondary block" />
                      <span className="font-body text-xs text-white/50 tracking-[0.12em]">{devDuplexCount} {devDuplexCount === 1 ? 'Empreendimento' : 'Empreendimentos'}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-secondary/60 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Experiência & Corporativo — Preview do Sobre */}
      <section className="py-24 bg-muted border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[1px] bg-secondary/20 transform -rotate-[30deg]" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="w-full lg:w-5/12 relative group shrink-0"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 p-2 md:p-6 border border-border">
                <img
                  src={fachadaImg}
                  alt="Fachada Imobiliária SmartImob"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-primary [clip-path:polygon(0_100%,0_0,100%_100%)]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-7/12"
            >
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8 uppercase tracking-widest relative inline-block">
                Experiência &amp; Corporativo
                <span className="absolute -bottom-4 left-0 w-24 h-[2px] bg-secondary" />
              </h2>

              <div className="mt-12 space-y-6 font-body text-muted-foreground font-light leading-relaxed text-sm md:text-base">
                <p>
                  Atuando no mercado de Santa Catarina (Itapema, Porto Belo e região) desde 2019, acompanhamos ativamente a evolução da região que hoje possui a maior valorização imobiliária do Brasil.
                </p>
                <p>
                  Nossa visão foi moldada no ambiente corporativo. A bagagem adquirida como sócio-diretor financeiro de empresas solidárias à construção civil (Simonetto Itapema e Lustrô) forneceu a expertise necessária para analisar propriedades não apenas como moradia, mas como veículos de investimento.
                </p>
                <p>
                  Enxergamos cada negociação através de duas lentes: segurança jurídica absoluta e rentabilidade no curto, médio e longo prazos.
                </p>
              </div>

              <a
                href="/sobre"
                className="inline-block mt-10 border border-foreground text-foreground hover:bg-primary hover:text-white px-8 py-3 font-body text-xs tracking-widest uppercase transition-all duration-300"
              >
                Conheça Nossa História
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section className="py-24 bg-white border-t border-border/50 relative overflow-hidden">
        <div className="absolute -top-10 -right-20 w-[500px] h-[1px] bg-secondary/30 transform -rotate-45" />

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-2xl text-foreground uppercase tracking-widest mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-secondary" />
                Sobre Nós
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed font-light mb-6">
                A Imobiliária SmartImob transcende a intermediação tradicional. Trazemos a bagagem analítica da diretoria financeira corporativa para estruturar investimentos imobiliários com foco total em rentabilidade e blindagem patrimonial.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed font-light">
                Com atuação exclusiva no mercado de alto padrão de Itapema, Porto Belo e Balneário Camboriú, mapeamos ativamente as oportunidades com maior potencial de valorização do litoral catarinense.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-display text-2xl text-foreground uppercase tracking-widest mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-secondary" />
                Nossa Abordagem
              </h2>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 border border-secondary/30 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground uppercase mb-2">Segurança Jurídica</h4>
                    <p className="font-body font-light text-sm text-muted-foreground">Transparência total em negociações e due diligence rigorosa de cada ativo ofertado no nosso portfólio.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 border border-secondary/30 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground uppercase mb-2">Performance Financeira</h4>
                    <p className="font-body font-light text-sm text-muted-foreground">Foco 100% voltado para rentabilidade, liquidez e diversificação estratégica em ativos premium.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-body text-xs tracking-[0.3em] uppercase text-secondary font-medium block mb-4">Fale Conosco</span>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-widest mb-6">
              Encontre o Imóvel<br />Ideal para Você
            </h2>
            <p className="font-body text-white/70 font-light mb-10 max-w-xl mx-auto">
              Entre em contato agora e descubra as melhores oportunidades do litoral catarinense. Atendimento exclusivo e personalizado.
            </p>
            <a
              href={buildWhatsAppUrl(company.settings?.whatsapp || company.phone || "48996764446", generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-4 font-display uppercase tracking-widest text-sm transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a9.896 9.896 0 01-4.741-1.207l-3.323.872.888-3.245A9.87 9.87 0 012.101 12C2.1 6.58 6.58 2.1 12 2.1s9.9 4.48 9.9 9.9c0 5.42-4.48 9.88-9.871 9.88z" />
              </svg>
              Falar pelo WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
