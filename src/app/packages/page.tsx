import HomePackages from "@/components/HomePackages";
import AuthGate from "@/components/AuthGate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Packages() {
  return (
    <>
      <Navbar />
      <AuthGate>
        <HomePackages />
      </AuthGate>
      <Footer />
    </>
  );
}
