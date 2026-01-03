import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useGlobal } from "../context/GlobalContext";

export default function Layout({ user }) {
  const navigate = useNavigate();
  const { theme, toggleTheme, showModal } = useGlobal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro detalhado:", error);
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        showModal(
          "Erro no Login",
          "Não foi possível conectar com o Google.",
          "error"
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* Header Sticky: Fica preso no topo */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-3 sticky top-0 z-40 transition-colors">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo - CORRIGIDO: Removido o 'hidden', agora o texto aparece sempre */}
          <Link
            to="/"
            className="text-xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 flex-shrink-0"
          >
             GiftList
          </Link>

          {/* Área Direita */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Botão Dark Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-yellow-400 transition cursor-pointer flex-shrink-0"
              title="Mudar Tema"
            >
              {theme === "light" ? (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {user ? (
              <>
                {/* Link Minhas Listas - Ícone no Mobile, Texto no Desktop */}
                <Link
                  to="/minhas-listas"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                >
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="hidden md:block font-medium">
                    Minhas Listas
                  </span>
                </Link>

                <div className="flex items-center gap-2 border-l pl-2 md:pl-4 border-gray-300 dark:border-gray-600 ml-1">
                  {/* Perfil Link */}
                  <Link
                    to="/perfil"
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition text-gray-800 dark:text-white"
                  >
                    <img
                      src={user.photoURL}
                      alt="Perfil"
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 object-cover flex-shrink-0"
                    />
                    <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                      {user.displayName}
                    </span>
                  </Link>

                  {/* Logout - Ícone no Mobile */}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold cursor-pointer rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    title="Sair"
                  >
                    <span className="hidden md:inline">Sair</span>
                    <svg
                      className="w-6 h-6 md:hidden"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
              >
                {isLoggingIn ? "..." : "Entrar"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
