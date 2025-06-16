
import AdvantagesSection from "@/components/AdvantagesSection";
import FAQSection from "@/components/FAQSection";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { Header } from "@/components/Header";
import SearchBar from "@/components/SearchBar";


export default function Home() {
  return (
    <main className="">
      <Header/>
      <SearchBar/>
      <FeaturedCarousel/>
      <AdvantagesSection/>
      <FAQSection/>

    </main>
  );
}
