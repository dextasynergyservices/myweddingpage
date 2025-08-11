import HowToPage from "@/components/HowToPage";
import AuthGate from "@/components/AuthGate";

export default function About() {
  return (
    <>
      <AuthGate>
        <HowToPage />
      </AuthGate>
    </>
  );
}
