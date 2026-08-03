import { motion } from "framer-motion";
import { Imovel } from "@/lib/types";
import { Link } from "react-router-dom";
import { MapPin, Building2, BedDouble, Car, Maximize } from "lucide-react";

interface ImovelCardProps {
  imovel: Imovel;
  index?: number;
}

export function ImovelCard({ imovel, index = 0 }: ImovelCardProps) {
  const capa = imovel.imagens.length > 0 ? imovel.imagens[0] : '/placeholder.jpg';

  return (
    <Link to={`/imovel/${imovel.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group flex flex-col cursor-pointer shadow-[0_4px_20px_rgba(227,30,36,0.08)] hover:shadow-[0_8px_32px_rgba(227,30,36,0.14)] transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={capa}
            alt={imovel.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Text info */}
        <div className="flex flex-col p-5 border border-t-0 border-border/60 bg-white">
          {/* Line 1: Property name */}
          <h3 className="font-display text-lg text-foreground uppercase font-semibold mb-1 group-hover:text-secondary transition-colors line-clamp-1">
            {imovel.nome}
          </h3>

          {/* Line 2: Property type */}
          <p className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-secondary shrink-0" />
            {imovel.tipo}
          </p>

          {/* Line 3: Location */}
          <p className="font-body text-sm text-muted-foreground flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-secondary shrink-0" />
            {imovel.localizacao || "Itapema/SC"}
          </p>

          <div className="w-full h-[1px] bg-border mb-4" />

          {/* Specs */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground uppercase tracking-wide mb-4">
            {imovel.metragem && imovel.metragem !== "Consulte" && (
              <span className="flex items-center gap-1.5" title="Área Privativa">
                <Maximize className="w-4 h-4 text-primary shrink-0" />
                {imovel.metragem}
              </span>
            )}
            {imovel.dormitorios && imovel.dormitorios !== "Consulte" && (
              <span className="flex items-center gap-1.5" title="Dormitórios/Suítes">
                <BedDouble className="w-4 h-4 text-primary shrink-0" />
                {imovel.dormitorios}
              </span>
            )}
            {imovel.vagas && imovel.vagas !== "Consulte" && (
              <span className="flex items-center gap-1.5" title="Vagas de Garagem">
                <Car className="w-4 h-4 text-primary shrink-0" />
                {imovel.vagas}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-border/40">
            <span className="font-serif-lux text-xl text-primary font-bold">
              {imovel.preco}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
