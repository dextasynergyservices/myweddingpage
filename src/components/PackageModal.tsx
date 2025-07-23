"use client";

import { useEffect, ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const PackageModal = ({ isOpen, onClose, children }: ModalProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Close only if backdrop itself is clicked
            if (e.target === backdropRef.current) {
              onClose();
            }
          }}
        >
          <motion.div
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full p-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Icon */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition cursor-pointer"
              onClick={onClose}
            >
              <X size={24} />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PackageModal;
