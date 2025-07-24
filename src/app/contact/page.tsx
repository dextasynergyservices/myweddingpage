import ContactPage from "@/components/ContactPage";
import AuthGate from "@/components/AuthGate";

export default function Contact() {
  return (
    <>
      <AuthGate>
        <ContactPage />
      </AuthGate>
    </>
  );
}
