import React from "react";
import { Phone, Mail, MessageSquare } from "lucide-react";

interface ContactUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactUpgradeModal({ isOpen, onClose }: ContactUpgradeModalProps) {
  if (!isOpen) return null;

  const whatsappUrl = "https://wa.me/2348103208297";
  const telUrl = "tel:+2348103208297";
  const mailtoPrimary = "mailto:info@dexta.services";
  const mailtoAlt = "mailto:hellodexta@gmail.com";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-2 text-center text-slate-900 dark:text-white">
          Contact us for Upgrade
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-300 mb-6">
          Choose an option below to reach our sales team and upgrade your plan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-green-50 hover:bg-green-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition"
            onClick={onClose}
          >
            <MessageSquare className="h-8 w-8 text-emerald-600" />
            <span className="font-semibold">WhatsApp</span>
            <span className="text-sm text-white">+234 810 320 8297</span>
          </a>

          <a
            href={telUrl}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition"
            onClick={onClose}
          >
            <Phone className="h-8 w-8 text-indigo-600" />
            <span className="font-semibold">Call</span>
            <span className="text-sm text-white">+234 810 320 8297</span>
          </a>

          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-yellow-50 hover:bg-yellow-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition">
            <Mail className="h-8 w-8 text-amber-600" />
            <div className="flex flex-col items-center">
              <a href={mailtoPrimary} onClick={onClose} className="font-semibold text-white">
                info@dexta.services
              </a>
              <a
                href={mailtoAlt}
                onClick={onClose}
                className="text-sm text-slate-500 mt-1 text-white"
              >
                hellodexta@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
