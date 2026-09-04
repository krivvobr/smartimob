import { motion } from "framer-motion";
import { Key, ArrowRight, Sparkles } from "lucide-react";
import { Imovel } from "@/lib/types";
import { ImovelCard } from "@/components/imoveis/ImovelCard";

interface ImoveisAluguelDestaqueProps {
  imoveis: Imovel[];
  onSelectLocacaoFilter?: () => void;
}

export function ImoveisAluguelDestaque({ imoveis, onSelectLocacaoFilter }: ImoveisAluguelDestaqueProps) {
  // Filter rental properties or fallback to sample rental property if none in state
  const locacaoImoveis = imoveis.filter(
    (i) => i.finalidade === "locacao" || i.finalidade === "ambos"
  );

  const displayImoveis = locacaoImoveis.length > 0 ? locacaoImoveis.slice(0, 3) : [];

  if (displayImoveis.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-display uppercase tracking-widest font-semibold mb-3"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Oportunidades de Locação</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl uppercase font-bold tracking-tight text-white"
            >
              Imóveis para Alugar <span className="text-primary font-serif-lux lowercase italic font-normal">em Destaque</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-body text-sm sm:text-base text-gray-400 mt-2 max-w-xl"
            >
              Confira nossa seleção exclusiva de imóveis residenciais e comerciais disponíveis para aluguel imediato.
            </motion.p>
          </div>

          {onSelectLocacaoFilter && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={onSelectLocacaoFilter}
              className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-widest font-semibold text-primary hover:text-white transition-colors group border border-primary/40 hover:border-white px-5 py-3 rounded-none self-start md:self-auto bg-primary/10 hover:bg-primary"
            >
              <span>Ver Todos para Alugar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayImoveis.map((imovel, index) => (
            <ImovelCard key={imovel.id} imovel={imovel} index={index} featured={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
