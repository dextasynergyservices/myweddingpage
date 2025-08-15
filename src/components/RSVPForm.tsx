"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function RSVPForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"ATTENDING" | "DECLINED">();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    setIsSubmitting(true);
    try {
      await axios.post(`/api/rsvp/${token}`, { status });
      toast.success("RSVP submitted successfully!");
      router.push("/thank-you");
    } catch (error) {
      console.error("Failed to submit RSVP", error);
      toast.error("Failed to submit RSVP");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">Will you be attending?</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="rsvp"
              checked={status === "ATTENDING"}
              onChange={() => setStatus("ATTENDING")}
              className="h-4 w-4"
            />
            <span>Yes, I&apos;ll be there!</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="rsvp"
              checked={status === "DECLINED"}
              onChange={() => setStatus("DECLINED")}
              className="h-4 w-4"
            />
            <span>No, I can&apos;t make it</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={!status || isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit RSVP"}
      </button>
    </form>
  );
}
