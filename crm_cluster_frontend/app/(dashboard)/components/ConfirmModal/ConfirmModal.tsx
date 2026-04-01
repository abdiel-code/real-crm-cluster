type ConfirmModalProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal = ({
  isOpen,
  message,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-[#0d1f3c] border-2 border-[#00d4ff40] rounded-md p-6 flex flex-col gap-4 w-full max-w-sm transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <h1 className="text-white text-xl font-bold">Confirm</h1>
        <p className="text-white/70">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded border border-white/20 text-white/60 hover:bg-[#00d4ff10] cursor-pointer"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
