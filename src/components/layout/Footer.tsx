import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { formatPhone, formatAddress } from "@/lib/formatters";
import { buildWhatsAppUrl, generalWhatsAppMessage } from "@/lib/whatsapp";

export const Footer = () => {
    const company = useCompany();

    const logoSrc = company.logo || "/logo.png";
    const brandDesc =
        company.settings?.brand?.siteDescription ||
        "A sua imobiliária no vale do rio Tijucas, Porto Belo, Itapema e Balneário Camboriú.";

    const fullAddress =
        formatAddress(company.address) ||
        "R. Atanásio Bernardes, 274 - Sala 01 - Centro, Tijucas - SC, 88200-000";

    const rawPhone = company.phone || "48996764446";
    const formattedPhone = formatPhone(rawPhone);
    const phoneDigits = rawPhone.replace(/\D/g, "");
    const phoneHref = `tel:+${phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`}`;

    const email = company.email || "contato@imoveissmart.com.br";
    const emailHref = `mailto:${email}`;

    const whatsappPhone = company.settings?.whatsapp || rawPhone;
    const whatsappUrl = buildWhatsAppUrl(whatsappPhone, generalWhatsAppMessage());
    const creci = company.settings?.creci || "7066-J, 7841-J";

    const instagramUrl = company.settings?.socialMedia?.instagram || "https://www.instagram.com/smartimob.imobiliaria/";
    const facebookUrl = company.settings?.socialMedia?.facebook || "https://www.facebook.com/smartimobassessoria/?ref=NONE_xav_ig_profile_page_web#";

    return (
        <footer id="contato" className="bg-[hsl(0_0%_17%)] text-white pt-32 pb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-24">
                    <div className="md:col-span-4 lg:col-span-5">
                        <Link to="/">
                            <img src={logoSrc} alt={company.name} className="h-14 mb-6" />
                        </Link>
                        <p className="font-body text-white/70 font-light leading-relaxed max-w-sm mb-8">
                            {brandDesc}
                        </p>
                        <div className="flex items-start gap-3 text-white/90">
                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="font-body text-sm font-light">{fullAddress}</p>
                        </div>
                    </div>

                    <div className="md:col-span-4 md:col-start-9">
                        <h5 className="font-body text-xs tracking-widest uppercase text-white font-medium mb-8">Contato Direto</h5>
                        <div className="space-y-4 font-body text-sm font-light text-white/70">
                            <a href={phoneHref} className="flex items-center gap-3 hover:text-primary transition-colors">
                                <Phone className="w-4 h-4 text-primary" /> {formattedPhone}
                            </a>
                            <a href={emailHref} className="flex items-center gap-3 hover:text-primary transition-colors">
                                <Mail className="w-4 h-4 text-primary" /> contato@imoveissmart.com.br
                            </a>
                            <div className="pt-4 flex items-center gap-3">
                                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300" aria-label="Instagram">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300" aria-label="Facebook">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300" aria-label="WhatsApp">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 gap-4">
                    <p className="font-body text-xs text-white/50 font-light tracking-wide uppercase">
                        © 2026 Imobiliária SmartImob.
                    </p>
                    <p className="font-body text-xs text-white/50 font-light tracking-wide uppercase">
                        Imobiliária SmartImob | CRECI {creci}
                    </p>
                </div>
            </div>
        </footer>
    );
};
