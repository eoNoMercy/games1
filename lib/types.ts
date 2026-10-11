export type Settings = {
  store_name: string; tagline: string; logo_url: string | null; whatsapp: string; address: string; maps_url: string;
  hours: string; instagram: string; hero_cover_url: string | null; hero_disc_url: string | null; hero_title: string; hero_platform: string;
};
export type GameConsole = { id: string; name: string; position: number };
export type Category = { id: string; name: string; text: string; position: number };
export type Product = {
  id: string; name: string; platform: string; platforms: string[]; category_id: string | null; description: string;
  image_url: string | null; position?: number; image_w?: number | null; image_h?: number | null; price: string | null; featured: boolean; active: boolean; created_at?: string;
};
