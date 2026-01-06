import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useGlobal } from "../context/GlobalContext";
import logoImg from "../assets/Logo.png"; // Ajustado para Logo.png (Case sensitive)

export default function Layout({ user }) {
  const navigate = useNavigate();
  const { showModal } = useGlobal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      // Esta linha força o Google a mostrar a tela de seleção de conta
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        showModal("Erro", "Falha no login com Google.", "error");
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
    <div className="min-h-screen bg-skin-base text-skin-body flex flex-col transition-colors duration-300">
      <header className="bg-(--color-header-bg) shadow-sm p-3 sticky top-0 z-50 transition-colors border-b border-skin-border">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={logoImg}
              alt="GiftList Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Área Direita */}
          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
              <>
                <Link
                  to="/minhas-listas"
                  className="hidden md:flex items-center gap-2 text-skin-muted hover:text-skin-primary px-3 py-2 rounded-lg hover:bg-skin-hover transition font-medium"
                >
                  Minhas Listas
                </Link>

                <Link
                  to="/minhas-listas"
                  className="md:hidden p-2 text-skin-muted hover:text-skin-primary hover:bg-skin-hover rounded-full"
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
                </Link>

                <div className="flex items-center gap-2 border-l pl-3 border-skin-border ml-1">
                  <Link
                    to="/perfil"
                    className="flex items-center gap-2 hover:bg-skin-hover p-1 pr-2 rounded-full transition group"
                  >
                    <img
                      src={user.photoURL}
                      alt="Perfil"
                      className="w-8 h-8 rounded-full border border-skin-border object-cover ring-2 ring-transparent group-hover:ring-skin-primary/30 transition-all"
                    />
                    <span className="hidden md:block text-sm font-semibold text-skin-heading max-w-25 truncate">
                      {user.displayName}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-skin-error-text hover:text-red-700 font-semibold cursor-pointer rounded-full hover:bg-skin-error-bg transition"
                    title="Sair"
                  >
                    <svg
                      className="w-5 h-5"
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
                className="btn-primary flex items-center gap-2 text-sm"
              >
                {isLoggingIn ? "..." : "Entrar com Google"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="grow container mx-auto p-4 md:p-6 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
