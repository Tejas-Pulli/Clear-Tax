import React from "react";

const ConfirmationModal = ({ message, subMessage, onConfirm, onCancel }) => {
  return (
    <div className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/3 shadow-xl">
        <div className="mb-4 text-lg font-semibold">{message}</div>
        <div className="flex flex-col">
  <div className="mb-4 text-sm">{subMessage}</div>
  <div className="flex justify-end space-x-4">
    <button
      className="px-6 py-2 bg-gray-400 text-white rounded-md"
      onClick={onCancel}
    >
      No
    </button>
    <button
      className="px-6 py-2 bg-green-600 text-white rounded-md"
      onClick={onConfirm}
    >
      Yes
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
