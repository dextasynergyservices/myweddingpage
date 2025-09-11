"use client";

import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import React from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this template? This action cannot be undone.",
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="py-2">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{message}</p>

        <div className="flex gap-2 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-slate-700 rounded-md"
            disabled={isProcessing}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : "Delete"}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
