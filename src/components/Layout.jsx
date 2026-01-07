import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { useGlobal } from "../context/GlobalContext";
import logoImg from "../assets/Logo.png";

export default function Layout({ user }) {
  const navigate = useNavigate();
  const { showModal } = useGlobal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados para o Modal Global de Nome
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Efeito para verificar se o usuário tem nome cadastrado no banco assim que logar
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          // Se o documento não existe ou o campo 'name' está vazio
          if (!docSnap.exists() || !docSnap.data().name) {
            // Sugere o nome do Google ou vazio
            setNameInput(user.displayName || "");
            setShowNameModal(true);
          }
        } catch (error) {
          console.error("Erro ao verificar perfil:", error);
        }
      }
    };
    checkUserProfile();
  }, [user]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      showModal(
        "Atenção",
        "Por favor, digite como prefere ser chamado.",
        "error"
      );
      return;
    }
    try {
      // 1. Atualiza no Firestore (usado pelas Listas)
      await setDoc(
        doc(db, "users", user.uid),
        { name: nameInput },
        { merge: true }
      );

      // 2. Atualiza no Auth do Firebase (perfil padrão)
      await updateProfile(user, { displayName: nameInput });

      setShowNameModal(false);
      showModal("Sucesso", "Nome salvo com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar nome:", error);
      showModal("Erro", "Não foi possível salvar seu nome.", "error");
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
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
    <div className="min-h-screen bg-skin-base text-skin-body flex flex-col transition-colors duration-300 relative">
      {/* --- Modal Global de Nome (Primeiro Acesso) --- */}
      {showNameModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-(--color-card-bg) rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-(--color-border) modal-animate">
            <h3 className="text-xl font-bold text-center text-(--color-card-heading) mb-2">
              Boas-vindas!
            </h3>
            <p className="text-center text-(--color-text-muted) mb-4 text-sm">
              Como você quer que seu nome apareça para seus amigos e nas listas?
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="input-field mb-4 w-full p-2 border rounded"
              placeholder="Seu nome completo"
              maxLength={30}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="btn-primary w-full py-2 rounded-lg font-bold"
            >
              Salvar e Continuar
            </button>
          </div>
        </div>
      )}

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

      {/* Mini Footer */}
      <footer className="py-6 mt-8 border-t border-skin-border bg-(--color-card-bg)">
        <div className="container mx-auto text-center">
          <p className="text-sm text-skin-muted font-medium">
            Meu Presente &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
