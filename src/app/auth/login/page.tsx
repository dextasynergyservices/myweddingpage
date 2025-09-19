import LoginPage from "@/components/LoginPage";
import AuthGate from "@/components/AuthGate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Register() {
  return (
    <>
      <AuthGate>
        <Navbar />
        <LoginPage />
      </AuthGate>
      <Footer />
    </>
  );
}
