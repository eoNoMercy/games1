import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Catalog from "@/components/Catalog";
import Offers from "@/components/Offers";
import Contact from "@/components/Contact";
import Location from "@/components/Location";
import Footer from "@/components/Footer";
import { getData } from "@/lib/data";
import { withSlugs } from "@/lib/utils";

export const revalidate = 300;

export default async function Home() {
  const { settings: s, categories, products, consoles } = await getData();
  const cats = withSlugs(categories);
  return (
    <>
      <Header s={s} />
      <main>
        <Hero s={s} />
        <Categories categories={cats.filter((c) => products.some((p) => p.category_id === c.id))} />
        <Catalog categories={cats} products={products} number={s.whatsapp} consoles={consoles} />
        <Offers products={products} number={s.whatsapp} />
        <Contact s={s} />
        <Location s={s} />
      </main>
      <Footer s={s} />
    </>
  );
}
