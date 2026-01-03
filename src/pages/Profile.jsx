import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth"; // Importado para atualizar o Auth
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

export default function Profile({ user }) {
  const { showModal } = useGlobal();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryUid = searchParams.get("uid");
  const fromListCode = searchParams.get("fromList");

  const targetUid = queryUid || (user ? user.uid : null);
  const isMyProfile = user && targetUid === user.uid;

  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    likes: "",
    dislikes: "",
    shoeSize: "",
    shirtSize: "",
    pantsSize: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Estado para loading do botão salvar

  const getAvatarUrl = () => {
    if (profileData.photoURL) return profileData.photoURL;
    if (isMyProfile && user.photoURL) return user.photoURL;
    const name = profileData.displayName || user?.displayName || "User";
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  useEffect(() => {
    if (!targetUid) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", targetUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (isMyProfile) {
            // Se o campo estiver vazio, usa o do Google como padrão visual
            if (!data.displayName) data.displayName = user.displayName;
            if (!data.photoURL) data.photoURL = user.photoURL;
          }
          setProfileData(data);
        } else if (isMyProfile) {
          setProfileData((prev) => ({
            ...prev,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar perfil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetUid, navigate, isMyProfile, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isMyProfile) return;
    setIsSaving(true);

    try {
      const newName = profileData.displayName || user.displayName;

      // 1. Salva no Perfil (Firestore)
      await setDoc(doc(db, "profiles", user.uid), profileData);

      // 2. Atualiza o Auth do Firebase (Para mudar no Cabeçalho imediatamente)
      if (auth.currentUser && newName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
          photoURL: profileData.photoURL || user.photoURL,
        });
        // Força um reload suave da página para o cabeçalho pegar o novo nome se necessário
        // (mas o React deve reagir sozinho se o state do user atualizar)
      }

      // 3. Atualiza o nome de dono em TODAS as listas já criadas (Firestore)
      // Isso garante que listas antigas mostrem o novo nome
      const batch = writeBatch(db);
      const q = query(
        collection(db, "lists"),
        where("ownerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((docSnap) => {
        // Atualiza apenas se o nome estiver diferente
        if (docSnap.data().ownerName !== newName) {
          batch.update(doc(db, "lists", docSnap.id), { ownerName: newName });
        }
      });
      await batch.commit();

      showModal(
        "Perfil Atualizado!",
        "Seu nome e foto foram atualizados em todo o site (perfil, listas e cabeçalho).",
        "success",
        () => {
          // Opcional: Recarregar para garantir que o Header atualize visualmente se o React não pegar
          window.location.reload();
        }
      );
    } catch (error) {
      console.error(error);
      showModal(
        "Erro",
        "Não foi possível salvar todas as alterações.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center dark:text-white mt-10">
        Carregando perfil...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-6">
      {fromListCode && (
        <Link
          to={`/${fromListCode}`}
          className="mb-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium p-2 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Voltar para a Lista
        </Link>
      )}

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow transition-colors border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 dark:border-blue-900 shadow-lg mb-4">
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {isMyProfile ? (
            <div className="w-full max-w-md text-center space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Seu Nome de Exibição
                </label>
                <input
                  type="text"
                  value={profileData.displayName || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      displayName: e.target.value,
                    })
                  }
                  className="text-2xl font-bold text-center w-full bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none dark:text-white transition-all pb-1 placeholder-gray-300"
                  placeholder="Seu Nome"
                />
              </div>
              <div className="pt-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  URL da Foto (Opcional)
                </label>
                <input
                  type="text"
                  value={profileData.photoURL || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, photoURL: e.target.value })
                  }
                  className="text-xs text-center w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 text-gray-600 dark:text-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Cole um link de imagem aqui..."
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {profileData.displayName || "Usuário sem nome"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Perfil de Presentes
              </p>
            </div>
          )}
        </div>

        {!isMyProfile && !profileData.likes && !profileData.shoeSize && (
          <div className="text-gray-500 dark:text-gray-400 mb-4 text-center italic">
            Esta pessoa ainda não preencheu os detalhes de gostos.
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Camiseta
              </label>
              <input
                disabled={!isMyProfile}
                value={profileData.shirtSize || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, shirtSize: e.target.value })
                }
                className="input-field text-center"
                placeholder="Ex: M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Calça
              </label>
              <input
                disabled={!isMyProfile}
                value={profileData.pantsSize || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, pantsSize: e.target.value })
                }
                className="input-field text-center"
                placeholder="Ex: 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Tênis
              </label>
              <input
                disabled={!isMyProfile}
                value={profileData.shoeSize || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, shoeSize: e.target.value })
                }
                className="input-field text-center"
                placeholder="Ex: 41"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coisas que eu AMO ❤️
            </label>
            <textarea
              disabled={!isMyProfile}
              rows={4}
              value={profileData.likes || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, likes: e.target.value })
              }
              className="input-field bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 focus:ring-green-500"
              placeholder="Ex: Chocolate amargo, livros de ficção, cor azul..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coisas que eu NÃO gosto ❌
            </label>
            <textarea
              disabled={!isMyProfile}
              rows={3}
              value={profileData.dislikes || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, dislikes: e.target.value })
              }
              className="input-field bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 focus:ring-red-500"
              placeholder="Ex: Uva passa, roupas apertadas..."
            />
          </div>

          {isMyProfile && (
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full py-3 text-lg font-semibold shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Atualizando Tudo...
                </>
              ) : (
                "Salvar Perfil"
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
