import React from "react";

const FormDivider = () => {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
      <span className="px-2 text-xs text-gray-500 dark:text-gray-400">or</span>
      <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
    </div>
  );
};

export default FormDivider;
