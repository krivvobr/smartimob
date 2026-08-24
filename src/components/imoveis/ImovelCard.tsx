import { motion } from "framer-motion";
import { Imovel } from "@/lib/types";
import { Link } from "react-router-dom";
import { MapPin, Building2, BedDouble, Car, Maximize, Sparkles } from "lucide-react";

interface ImovelCardProps {
  imovel: Imovel;
  index?: number;
  featured?: boolean;
}

export function ImovelCard({ imovel, index = 0, featured = false }: ImovelCardProps) {
  const capa = imovel.imagens && imovel.imagens.length > 0 ? imovel.imagens[0] : "/placeholder.jpg";
  const isDestaque = featured || imovel.destaque;

  return (
    <Link to={`/imovel/${imovel.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group flex flex-col h-full cursor-pointer bg-white border border-border/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(227,30,36,0.16)] transition-all duration-500 relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-primary transition-colors duration-500 z-10" />

        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={capa}
            alt={imovel.nome}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isDestaque && (
              <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] uppercase font-display tracking-widest font-bold px-2.5 py-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                Destaque
              </span>
            )}
            {imovel.finalidade && (
              <span className="inline-block bg-[#1a1a1a]/90 backdrop-blur-sm text-white/90 text-[9px] uppercase font-body tracking-wider px-2 py-0.5 border border-white/20">
                {imovel.finalidade === "locacao" ? "Locação" : "Venda"}
              </span>
            )}
          </div>
        </div>

        {/* Text info */}
        <div className="flex flex-col flex-1 p-5 sm:p-6 bg-white justify-between">
          <div>
            {/* Line 1: Property name */}
            <h3 className="font-display text-lg sm:text-xl text-foreground uppercase font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {imovel.nome}
            </h3>

            {/* Line 2: Property type */}
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-secondary shrink-0" />
              {imovel.tipo}
            </p>

            {/* Line 3: Location */}
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              {imovel.localizacao || "Itapema/SC"}
            </p>

            <div className="w-full h-[1px] bg-border/60 mb-4" />

            {/* Specs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground uppercase tracking-wide mb-4">
              {imovel.metragem && imovel.metragem !== "Consulte" && (
                <span className="flex items-center gap-1" title="Área Privativa">
                  <Maximize className="w-3.5 h-3.5 text-primary shrink-0" />
                  {imovel.metragem}
                </span>
              )}
              {imovel.dormitorios && imovel.dormitorios !== "Consulte" && (
                <span className="flex items-center gap-1" title="Dormitórios/Suítes">
                  <BedDouble className="w-3.5 h-3.5 text-primary shrink-0" />
                  {imovel.dormitorios}
                </span>
              )}
              {imovel.vagas && imovel.vagas !== "Consulte" && (
                <span className="flex items-center gap-1" title="Vagas de Garagem">
                  <Car className="w-3.5 h-3.5 text-primary shrink-0" />
                  {imovel.vagas}
                </span>
              )}
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="font-serif-lux text-xl sm:text-2xl text-primary font-bold">
              {imovel.preco}
            </span>
            <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors font-medium">
              Ver Detalhes →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
