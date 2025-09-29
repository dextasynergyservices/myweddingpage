"use client";

import Link from "next/link";

interface PreviewModalFooterProps {
  isModal?: boolean;
}

export default function PreviewModalFooter({ isModal = false }: PreviewModalFooterProps) {
  const handleCloseModal = () => {
    window.parent?.postMessage({ action: "close-modal" }, "*");
  };

  if (!isModal) return null;

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">This wedding page is no longer live</p>
        <div className="flex space-x-3">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <Link
            href="/packages"
            target="_parent"
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700"
          >
            Create Similar Page
          </Link>
        </div>
      </div>
    </div>
  );
}
