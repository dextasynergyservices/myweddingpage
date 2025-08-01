import LoginPage from "@/components/LoginPage";
import AuthGate from "@/components/AuthGate";

export default function Register() {
  return (
    <>
      <AuthGate>
        <LoginPage />
      </AuthGate>
    </>
  );
}
