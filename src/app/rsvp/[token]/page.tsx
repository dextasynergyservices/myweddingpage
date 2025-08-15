import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RSVPForm from "@/components/RSVPForm";

export default async function RSVPPage({ params }: { params: { token: string } }) {
  const guest = await prisma.guest.findUnique({
    where: { invitationToken: params.token },
  });

  if (!guest) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">RSVP for {guest.name}</h1>
        <RSVPForm token={params.token} />
      </div>
    </div>
  );
}
