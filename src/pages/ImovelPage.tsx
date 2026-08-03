import { useParams, Link } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { imoveis as staticImoveis } from "@/data/imoveis";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, BedDouble, Car, Maximize, Building2, Check, Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/lib/supabase";
import { Imovel, mapPropertyToImovel, mapDevelopmentToImovel } from "@/lib/types";
import { buildWhatsAppUrl, propertyWhatsAppMessage } from "@/lib/whatsapp";

export default function ImovelPage() {
  const { slug } = useParams();
  const company = useCompany();
  
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [emblaRef] = useEmblaCarousel();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    
    async function fetchProperty() {
      if (!slug) return;
      
      // Attempt static find first
      const foundStatic = staticImoveis.find((i) => i.id === slug);
      if (foundStatic) {
        setImovel(foundStatic);
        setLoading(false);
        return;
      }
      
      try {
        // 1. Try to find in properties table
        const { data: propData, error: propError } = await supabase
          .from("properties")
          .select("*")
          .eq("id", slug)
          .maybeSingle();
          
        if (propData) {
          setImovel(mapPropertyToImovel(propData));
        } else {
          // 2. Try to find in developments table
          const { data: devData, error: devError } = await supabase
            .from("developments")
            .select("*")
            .eq("id", slug)
            .maybeSingle();

          if (devData) {
            // Get child properties to compute dynamic specs
            const { data: childProps } = await supabase
              .from("properties")
              .select("*")
              .eq("development_id", devData.id);
              
            setImovel(mapDevelopmentToImovel(devData, childProps || []));
          } else {
            setImovel(null);
          }
        }
      } catch (err) {
        console.error("Error loading property/development:", err);
        setImovel(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProperty();
  }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imovel || !company?.id) return;
    
    setIsSubmitting(true);
    setFormError("");
    
    try {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(imovel.id);
      
      const { error } = await supabase.from("leads").insert({
        name: formName,
        email: formEmail || null,
        phone: formPhone || null,
        source: "website",
        notes: `Interesse no ${imovel.isDevelopment ? "empreendimento" : "imóvel"}: ${imovel.nome} (ID/Slug: ${imovel.id}). ${formMessage ? `Mensagem: ${formMessage}` : ""}`,
        company_id: company.id,
        property_id: !imovel.isDevelopment && isUuid ? imovel.id : null,
        development_id: imovel.isDevelopment && isUuid ? imovel.id : null,
      });

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error sending lead:", err);
      setFormError("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente ou fale pelo WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Navbar />
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">Carregando detalhes...</span>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-background flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-2xl text-foreground font-display uppercase tracking-widest">Imóvel não encontrado</h1>
        <Link to="/" className="mt-6 text-primary hover:underline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Voltar para a página inicial
        </Link>
        <Footer />
      </div>
    );
  }

  const capa = imovel.imagens.length > 0 ? imovel.imagens[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <section className="relative min-h-[60vh] flex items-center justify-center pt-24 bg-zinc-50">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src={capa} alt={imovel.nome} className="absolute inset-0 w-full h-full object-cover" />

        <div className="relative z-20 container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-foreground/60 backdrop-blur-md p-8 border border-secondary/30 shadow-2xl max-w-2xl"
          >
            <h1 className="font-display text-3xl md:text-5xl text-white mb-2 tracking-wider uppercase">
              {imovel.nome}
            </h1>
            <h2 className="font-body text-xs md:text-sm tracking-[0.2em] uppercase text-secondary flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" /> {imovel.tipo}
            </h2>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <Link to="/" className="inline-flex items-center text-xs uppercase tracking-widest text-primary hover:text-primary/80 mb-12 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar aos Empreendimentos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <h3 className="font-display text-2xl text-foreground uppercase tracking-widest flex items-center gap-4">
                <span className="w-8 h-[1px] bg-primary" />
                Sobre o Projeto
              </h3>
              <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {imovel.descricao || `Bem-vindo ao ${imovel.nome}. Com design arrojado e localização privilegiada no litoral catarinense, oferece o melhor em conforto e sofisticação. As metragens, detalhes da planta e valores atualizados variam conforme a tabela oficial. Consulte nosso corretor para obter opções de financiamento e customização.`}
              </div>

              {imovel.imagens.length > 0 && (
                <div className="pt-8">
                  <h3 className="font-display text-2xl text-foreground uppercase tracking-widest flex items-center gap-4 mb-6">
                    <span className="w-8 h-[1px] bg-primary" />
                    Galeria ({imovel.imagens.length})
                  </h3>

                  <div className="overflow-hidden border border-border" ref={emblaRef}>
                    <div className="flex">
                      {imovel.imagens.map((img, i) => (
                        <div
                          key={i}
                          className="flex-[0_0_100%] min-w-0 relative aspect-[16/9] cursor-pointer"
                          onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                        >
                          <img src={img} alt={`Imagem ${i + 1}`} className="absolute w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Deslize para ver mais imagens</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {imovel.imagens.slice(0, 8).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square relative group overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      >
                        <img src={img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                    {imovel.imagens.length > 8 && (
                      <div className="col-span-full text-center mt-4">
                        <span className="text-sm text-muted-foreground">E mais {imovel.imagens.length - 8} imagens.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="bg-zinc-100 border border-border/50 p-8">
                <h4 className="font-display text-xl text-foreground uppercase tracking-widest mb-6 border-b border-border pb-4">
                  Informações
                </h4>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Valor Estimado / Tabela</span>
                    <span className="font-serif-lux text-2xl text-primary">{imovel.preco}</span>
                  </div>
                  <div className="h-[1px] w-full bg-border" />
                  <div>
                    <span className="block text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Tipo do Imóvel</span>
                    <span className="font-display text-foreground">{imovel.tipo}</span>
                  </div>
                  {imovel.metragem && imovel.metragem !== "Consulte" && (
                    <>
                      <div className="h-[1px] w-full bg-border" />
                      <div>
                        <span className="block text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><Maximize className="w-3 h-3" /> Área Privativa</span>
                        <span className="font-display text-foreground">{imovel.metragem}</span>
                      </div>
                    </>
                  )}
                  {imovel.dormitorios && imovel.dormitorios !== "Consulte" && (
                    <>
                      <div className="h-[1px] w-full bg-border" />
                      <div>
                        <span className="block text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><BedDouble className="w-3 h-3" /> Dormitórios/Suítes</span>
                        <span className="font-display text-foreground">{imovel.dormitorios}</span>
                      </div>
                    </>
                  )}
                  {imovel.vagas && imovel.vagas !== "Consulte" && (
                    <>
                      <div className="h-[1px] w-full bg-border" />
                      <div>
                        <span className="block text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><Car className="w-3 h-3" /> Vagas de Garagem</span>
                        <span className="font-display text-foreground">{imovel.vagas}</span>
                      </div>
                    </>
                  )}
                  <div className="h-[1px] w-full bg-border" />
                  <div>
                    <span className="block text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</span>
                    <span className="font-display text-foreground">{imovel.localizacao || "Itapema/SC"}</span>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl(company.phone, propertyWhatsAppMessage(imovel.nome))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-8 bg-primary hover:bg-[hsl(0_73%_41%)] text-white py-4 font-display uppercase tracking-widest text-sm transition-colors duration-300 flex justify-center items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                  Falar com Corretor
                </a>
              </div>

              {/* Lead capture form */}
              <div className="bg-white border border-border p-8 shadow-sm">
                <h4 className="font-display text-lg text-foreground uppercase tracking-widest mb-6 border-b border-border pb-4">
                  Tenho Interesse
                </h4>
                {isSubmitted ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                    <div className="w-12 h-12 bg-secondary/15 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="font-display text-foreground text-sm uppercase tracking-wide mb-2">Mensagem Enviada!</p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      Obrigado pelo contato. Em breve o corretor retornarará com mais informações.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                      <div className="text-xs text-red-600 bg-red-50 p-3 border border-red-200">
                        {formError}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-zinc-50 border border-border px-4 py-3 font-body text-sm outline-none focus:border-secondary focus:bg-white transition-all duration-300 text-foreground"
                        placeholder="Seu nome"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">E-mail</label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-border px-4 py-3 font-body text-sm outline-none focus:border-secondary focus:bg-white transition-all duration-300 text-foreground"
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-zinc-50 border border-border px-4 py-3 font-body text-sm outline-none focus:border-secondary focus:bg-white transition-all duration-300 text-foreground"
                        placeholder="(99) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Mensagem (Opcional)</label>
                      <textarea
                        rows={3}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full bg-zinc-50 border border-border px-4 py-3 font-body text-sm outline-none resize-none focus:border-secondary focus:bg-white transition-all duration-300 text-foreground"
                        placeholder={`Olá! Gostaria de mais informações sobre o ${imovel.nome}.`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-[hsl(0_73%_41%)] disabled:bg-zinc-400 disabled:cursor-not-allowed text-white py-4 font-display uppercase tracking-widest text-sm transition-colors duration-300 flex justify-center items-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Contato"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {imovel && imovel.imagens.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={imovel.imagens.map((src) => ({ src }))}
          plugins={[Zoom]}
        />
      )}
    </div>
  );
}
