"use client";

import Link from "next/link";

const ViewFaqButton = () => {
  return (
    <Link href="/how-to#faq" scroll={false}>
      <button
        type="button"
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition cursor-pointer"
      >
        View FAQ
      </button>
    </Link>
  );
};

export default ViewFaqButton;
