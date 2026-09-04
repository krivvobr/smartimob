import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useCompany } from "@/contexts/CompanyContext";
import { buildWhatsAppUrl, generalWhatsAppMessage } from "@/lib/whatsapp";

export const Navbar = () => {
    const location = useLocation();
    const isHome = location.pathname === "/";
    const company = useCompany();

    const whatsappPhone = company.settings?.whatsapp || company.phone || "48996764446";
    const whatsappUrl = buildWhatsAppUrl(whatsappPhone, generalWhatsAppMessage());

    const instagramUrl = company.settings?.socialMedia?.instagram || "https://www.instagram.com/smartimob.imobiliaria/";
    const facebookUrl = company.settings?.socialMedia?.facebook || "https://www.facebook.com/smartimobassessoria/?ref=NONE_xav_ig_profile_page_web#";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Barra do menu */}
            <div className="bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
                <div className="container mx-auto px-6 h-16 md:h-[4.5rem] flex items-center justify-end relative">
                    {/* Logo em caixa sobressaindo sobre menu + slider */}
                    <Link
                        to="/"
                        className="absolute left-6 top-3 z-50 group"
                        aria-label={company.name}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="
                                relative
                                bg-[#1a1a1a]
                                border border-white/10
                                shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(227,30,36,0.15)]
                                p-2.5 md:p-3
                                w-[5.5rem] h-[5.5rem]
                                md:w-[7.5rem] md:h-[7.5rem]
                                lg:w-[8.5rem] lg:h-[8.5rem]
                                flex items-center justify-center
                                transition-transform duration-300
                                group-hover:-translate-y-0.5
                                group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.4),0_0_0_1px_rgba(227,30,36,0.35)]
                            "
                        >
                            {/* filete vermelho no topo da caixa */}
                            <span className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
                            <img
                                src={company.logo || logo}
                                alt={company.name}
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                    </Link>

                    <div className="flex items-center gap-8 pl-[6.5rem] md:pl-[9rem] lg:pl-[10rem]">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="hidden md:flex items-center gap-8 font-body text-xs tracking-widest uppercase font-medium"
                        >
                            {isHome ? (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="text-foreground/70 hover:text-primary transition-colors cursor-pointer"
                                >
                                    Home
                                </a>
                            ) : (
                                <Link to="/" className="text-foreground/70 hover:text-primary transition-colors">Home</Link>
                            )}
                            {isHome ? (
                                <a
                                    href="#imoveis"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="text-foreground/70 hover:text-primary transition-colors cursor-pointer"
                                >
                                    Empreendimentos
                                </a>
                            ) : (
                                <Link to="/#imoveis" className="text-foreground/70 hover:text-primary transition-colors">Empreendimentos</Link>
                            )}

                            <Link to="/sobre" className="text-foreground/70 hover:text-primary transition-colors">Sobre</Link>
                        </motion.div>

                        <div className="flex items-center gap-5 border-l border-border pl-6 md:pl-8">
                            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors" aria-label="Instagram">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors" aria-label="WhatsApp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
