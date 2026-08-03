export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return `https://wa.me/?text=${encodeURIComponent(message)}`;
  // Ensure country code is present. In Brazil it is 55.
  const formattedPhone = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function propertyWhatsAppMessage(title: string): string {
  return `Olá! Vi o imóvel *${title}* no site e gostaria de mais informações.`;
}

export function developmentWhatsAppMessage(name: string): string {
  return `Olá! Tenho interesse no empreendimento *${name}*. Pode me dar mais informações?`;
}

export function generalWhatsAppMessage(): string {
  return "Olá! Gostaria de mais informações sobre seus imóveis.";
}
