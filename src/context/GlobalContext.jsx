import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
    onConfirm: null,
  });

  const showModal = (title, message, type = "success", onConfirm = null) => {
    setModal({ open: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ ...modal, open: false });
  };

  const getModalColors = (type) => {
    switch (type) {
      case "error":
        return "bg-[var(--color-error-bg)] text-[var(--color-error-text)]";
      case "info":
        return "bg-[var(--color-info-bg)] text-[var(--color-info-text)]";
      default:
        return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
    }
  };

  return (
    <GlobalContext.Provider value={{ showModal }}>
      {children}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-2xl max-w-sm w-full p-6 modal-animate border border-[var(--color-border)] transition-colors">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${getModalColors(
                modal.type
              )}`}
            >
              {modal.type === "success" && (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {modal.type === "error" && (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {modal.type === "info" && (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-bold text-center text-[var(--color-card-heading)] mb-2">
              {modal.title}
            </h3>
            <p className="text-center text-[var(--color-text-muted)] mb-6">
              {modal.message}
            </p>

            <div className="flex gap-3 justify-center">
              {modal.onConfirm ? (
                <>
                  <button
                    onClick={closeModal}
                    className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      modal.onConfirm();
                      closeModal();
                    }}
                    className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Confirmar
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-card-heading)] text-[var(--color-card-bg)] hover:opacity-90 font-medium transition-colors"
                >
                  Entendi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => useContext(GlobalContext);
