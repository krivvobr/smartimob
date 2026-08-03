export function formatPrice(price?: number): string {
  if (!price) return "Consulte";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area?: number): string {
  if (!area) return "—";
  return `${area.toLocaleString("pt-BR")}m²`;
}

export function formatPhone(phone?: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}

export function formatAddress(address?: {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): string {
  if (!address) return "";

  const streetLine = [address.street, address.number].filter(Boolean).join(", ");
  const withComplement = [streetLine, address.complement].filter(Boolean).join(" - ");
  const locality = [address.neighborhood, address.city].filter(Boolean).join(", ");
  const cityState = locality
    ? address.state
      ? `${locality} - ${address.state}`
      : locality
    : address.state || "";
  const withZip = [cityState, address.zipCode].filter(Boolean).join(", ");

  return [withComplement, withZip].filter(Boolean).join(" - ");
}
