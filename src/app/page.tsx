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
      {/* Container untuk Hero agar tidak tertabrak header fixed */}
      <div className="pt-16">
        <Hero />
      </div>
      {/* Ticker looping tepat setelah Hero */}
      <MarqueeBanner />

      <div className="space-y-4">
        <Promo />
        <ShopTheLook />
        <Categories />
        <LatestArticles />
        <Marketplace />
      </div>
      <Footer />
    </main>
  );
}
