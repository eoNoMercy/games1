const phone = (n: string) => {
  const d = (n ?? "").replace(/\D/g, "");
  return d && d.length <= 11 ? `55${d}` : d;
};
export const whatsappLink = (number: string, message: string) => `https://wa.me/${phone(number)}?text=${encodeURIComponent(message)}`;
export const mapsLink = (mapsUrl: string, address: string) =>
  mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
export const directionsLink = (address: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
export const mapEmbed = (address: string) => `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
