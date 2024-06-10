import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};
const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  const modalContentRef = React.useRef<HTMLDivElement>(null);

  const handleClose = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (modalContentRef.current && modalContentRef.current.contains(e.target as Node)) {
      // Click was inside the modal content, don't close the modal
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={handleClose}>
      {/* <div className="absolute rounded-lg max-w-5xl w-full h-full bg-black"></div> */}

      <div className="relative max-w-full p-7" ref={modalContentRef}>
        <div className="absolute inset-0 bg-black rounded-lg"></div>

        <div className="relative bg-base-200 border border-base-200 rounded-lg p-7 max-w-5xl w-full">
          {children}
          <XMarkIcon className="absolute top-4 right-4 w-10 h-10 hover:cursor-pointer" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default Modal;
