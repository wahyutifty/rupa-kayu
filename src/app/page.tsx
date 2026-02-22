import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MarqueeBanner from "@/components/MarqueeBanner";
import ShopTheLook from "@/components/ShopTheLook";
import Categories from "@/components/Categories";
import Promo from "@/components/Promo";
import Marketplace from "@/components/Marketplace";
import LatestArticles from "@/components/LatestArticles";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      {/* Ticker looping di bawah hero, setelah header fixed */}
      <MarqueeBanner />
      <Promo />
      <ShopTheLook />
      <Categories />
      <LatestArticles />
      <Marketplace />
      <Footer />
    </main>
  );
}
