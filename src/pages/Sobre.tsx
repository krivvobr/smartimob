import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import fachadaImg from "@/assets/fachada-smartimob.jpg";
import { Target, Lightbulb, ShieldCheck } from "lucide-react";

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const Sobre = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-secondary selection:text-white pt-24">
            <Navbar />

            {/* Header da Página Sobre */}
            <section className="relative py-24 md:py-32 bg-white overflow-hidden">
                {/* Decorative Gold Elements */}
                <div className="absolute top-0 right-[10%] w-[1px] h-full bg-secondary/30 transform -rotate-[25deg]" />
                <div className="absolute top-[30%] left-[-10%] w-[500px] h-[1px] bg-secondary/30 transform -rotate-[25deg]" />

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial="hidden" animate="show" variants={staggerContainer}
                        className="max-w-4xl mx-auto bg-primary/5 p-8 md:p-16 border border-border relative"
                    >
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20" />

                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-8">
                            <span className="h-[1px] w-12 bg-secondary block" />
                            <span className="font-body text-xs tracking-[0.3em] uppercase text-secondary font-medium">História e Valores</span>
                            <span className="h-[1px] w-12 bg-secondary block" />
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-6xl text-foreground mb-6 uppercase tracking-wider">
                            Imobiliária SmartImob <br /><span className="text-secondary italic font-serif-lux lowercase">assessoria</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} className="font-body text-muted-foreground font-light max-w-2xl mx-auto mt-6">
                            Muito além da intermediação. Uma consultoria focada em estruturar capital, preservar patrimônio e oferecer oportunidades únicas no litoral catarinense.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Nossa Origem */}
            <section className="py-24 bg-white relative border-t border-border">
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
                            className="w-full lg:w-1/2 relative group"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 p-2 md:p-6 border border-border">
                                <img src={fachadaImg} alt="Fachada Imobiliária SmartImob" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />

                                {/* Overlay angular base */}
                                <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-primary [clip-path:polygon(0_100%,0_0,100%_100%)]" />
                            </div>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
                            className="w-full lg:w-1/2"
                        >
                            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl text-foreground mb-8 uppercase tracking-widest relative inline-block">
                                Experiência & Corporativo
                                <span className="absolute -bottom-4 left-0 w-24 h-[2px] bg-secondary" />
                            </motion.h2>

                            <motion.div variants={fadeUp} className="mt-12 space-y-6 font-body text-muted-foreground font-light leading-relaxed text-sm md:text-base">
                                <p>
                                    Atuando no mercado de Santa Catarina (Itapema, Porto Belo e região) desde 2019, acompanhamos ativamente a evolução da região que hoje possui a maior valorização imobiliária do Brasil.
                                </p>
                                <p>
                                    Nossa visão foi moldada no ambiente corporativo. A bagagem adquirida como sócio-diretor financeiro de empresas solidárias à construção civil (Simonetto Itapema e Lustrô) forneceu a expertise necessária para analisar propriedades não apenas como moradia, mas como veículos de investimento.
                                </p>
                                <p>
                                    Enxergamos cada negociação através de duas lentes: segurança jurídica absoluta e rentabilidade no curto, médio e longo prazos.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pilares Estratégicos */}
            <section className="py-24 bg-foreground text-white relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="font-body text-xs tracking-[0.3em] uppercase text-secondary font-medium block mb-4">A Fundação do Negócio</span>
                        <h3 className="font-display text-3xl md:text-4xl">Pilares da <span className="text-secondary italic">Nossa Marca</span></h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                            className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors"
                        >
                            <Target className="w-8 h-8 text-secondary mb-6" />
                            <h4 className="font-display text-xl uppercase tracking-wider mb-4">Missão</h4>
                            <p className="font-body font-light text-white/80 leading-relaxed text-sm">
                                Oferecer soluções imobiliárias completas, seguras e personalizadas, conectando pessoas aos imóveis ideais para viver, investir e prosperar. Atuar com profissionalismo, ética e transparência em todas as etapas, garantindo confiança, tranquilidade e excelência na experiência de cada cliente.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors"
                        >
                            <Lightbulb className="w-8 h-8 text-secondary mb-6" />
                            <h4 className="font-display text-xl uppercase tracking-wider mb-4">Visão</h4>
                            <p className="font-body font-light text-white/80 leading-relaxed text-sm">
                                Ser reconhecida como uma imobiliária de referência em Santa Catarina, destacando-se pela credibilidade, qualidade no atendimento, conhecimento de mercado e capacidade de gerar valor real para clientes, parceiros e investidores, construindo relacionamentos duradouros e negócios sustentáveis.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors"
                        >
                            <ShieldCheck className="w-8 h-8 text-secondary mb-6" />
                            <h4 className="font-display text-xl uppercase tracking-wider mb-4">Valores</h4>
                            <div className="font-body font-light text-white/80 leading-relaxed text-sm space-y-4">
                                <p><strong className="text-white font-medium block">Ética e Transparência</strong> Atuar com honestidade, clareza e responsabilidade em todas as negociações.</p>
                                <p><strong className="text-white font-medium block">Profissionalismo</strong> Buscar excelência técnica, atualização constante e alto padrão de atendimento.</p>
                                <p><strong className="text-white font-medium block">Respeito às Pessoas</strong> Valorizar clientes, parceiros e colaboradores, entendendo cada necessidade de forma única.</p>
                                <p><strong className="text-white font-medium block">Comprometimento com Resultados</strong> Trabalhar com foco em soluções eficientes, seguras e alinhadas aos objetivos do cliente.</p>
                                <p><strong className="text-white font-medium block">Confiança e Credibilidade</strong> Construir relações sólidas, baseadas em confiança mútua e reputação consistente.</p>
                                <p><strong className="text-white font-medium block">Evolução Contínua</strong> Encarar desafios como oportunidades de crescimento, inovação e aprimoramento.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Sobre;
