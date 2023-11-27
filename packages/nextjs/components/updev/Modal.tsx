import React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-neutral-800 rounded-lg p-7 max-w-5xl w-full">
        {children}
        <XCircleIcon className="absolute top-4 right-4 w-10 h-10 hover:cursor-pointer" onClick={onClose} />
      </div>
    </div>
  );
};

export default Modal;