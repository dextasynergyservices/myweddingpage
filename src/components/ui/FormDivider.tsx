import React from "react";

const FormDivider = () => {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow h-px bg-[#ab862b]/20 dark:bg-[#ab862b]/20"></div>
      <span className="px-2 text-xs text-[#ab862b]/50 dark:text-[#ab862b]/50">
        or
      </span>
      <div className="flex-grow h-px bg-[#ab862b]/20 dark:bg-[#ab862b]/20"></div>
    </div>
  );
};

export default FormDivider;
