import RegisterPage from "@/components/RegisterPage";
import AuthGate from "@/components/AuthGate";

export default function Register() {
  return (
    <>
      <AuthGate>
        <RegisterPage />
      </AuthGate>
    </>
  );
}
