import HomeHero from "@/components/HomeHero";
import HomeFeatures from "@/components/HomeFeature";
import HomePackages from "@/components/HomePackages";
import HomeFindWedding from "@/components/HomeFindWedding";
import HomeTestimonials from "@/components/HomeTestimonials";
import AuthGate from "@/components/AuthGate";

export default function Home() {
  return (
    <>
      <AuthGate>
        <HomeHero />
        <HomeFeatures />
        <HomePackages />
        <HomeFindWedding />
        <HomeTestimonials />
      </AuthGate>
    </>
  );
}
