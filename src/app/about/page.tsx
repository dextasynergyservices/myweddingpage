import AboutPage from "@/components/AboutPage";
import AuthGate from "@/components/AuthGate";

export default function About() {
  return (
    <>
      <AuthGate>
        <AboutPage />
      </AuthGate>
    </>
  );
}
