import { createContext, useContext, useState, useEffect } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  // --- Lógica do Tema (Dark Mode Padrão) ---
  const [theme, setTheme] = useState(() => {
    // 1. Tenta pegar a escolha salva no navegador (se o usuário já mudou antes, respeita a escolha dele)
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    // 2. Se for a primeira vez que entra, define DARK como padrão
    return "dark";
  });

  // Atualiza o HTML (adiciona a classe 'dark') e salva no navegador quando muda
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // --- Lógica do Modal ---
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

  return (
    <GlobalContext.Provider value={{ theme, toggleTheme, showModal }}>
      {children}

      {/* Componente Visual do Modal Renderizado Globalmente */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 modal-animate border border-gray-100 dark:border-gray-700 transition-colors">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 
              ${
                modal.type === "success"
                  ? "bg-green-100 text-green-600"
                  : modal.type === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
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

            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {modal.title}
            </h3>
            <p className="text-center text-gray-500 dark:text-gray-300 mb-6">
              {modal.message}
            </p>

            <div className="flex gap-3 justify-center">
              {modal.onConfirm ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      modal.onConfirm();
                      closeModal();
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
                  >
                    Confirmar
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-700 text-white hover:opacity-90 font-medium transition-colors"
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
