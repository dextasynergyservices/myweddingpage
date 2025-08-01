import HomePackages from "@/components/HomePackages";
import AuthGate from "@/components/AuthGate";

export default function Packages() {
  return (
    <>
      <AuthGate>
        <HomePackages />
      </AuthGate>
    </>
  );
}
