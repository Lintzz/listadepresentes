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
import { updateProfile } from "firebase/auth";
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
  const [isSaving, setIsSaving] = useState(false);

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
        // CORREÇÃO: Mudado de 'profiles' para 'users' para alinhar com o Layout e ListView
        const docRef = doc(db, "users", targetUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // CORREÇÃO: Se tiver 'name' (do login inicial) mas não 'displayName', usamos o 'name'
          if (data.name && !data.displayName) {
            data.displayName = data.name;
          }

          if (isMyProfile) {
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
        console.error(error);
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

      // CORREÇÃO: Salvamos também o campo 'name' para garantir compatibilidade com a Lista
      // E usamos a coleção 'users'
      await setDoc(doc(db, "users", user.uid), {
        ...profileData,
        name: newName, // Importante para o ListView achar o nome
        displayName: newName,
      });

      if (auth.currentUser && newName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
          photoURL: profileData.photoURL || user.photoURL,
        });
      }

      // Atualiza o nome do dono nas listas antigas
      const batch = writeBatch(db);
      const q = query(
        collection(db, "lists"),
        where("ownerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        if (docSnap.data().ownerName !== newName) {
          batch.update(doc(db, "lists", docSnap.id), { ownerName: newName });
        }
      });
      await batch.commit();

      showModal(
        "Perfil Atualizado!",
        "Dados salvos com sucesso.",
        "success",
        () => {
          // Recarregar não é estritamente necessário se o estado atualizar,
          // mas garante que o header pegue a foto nova se mudou
          window.location.reload();
        }
      );
    } catch (error) {
      console.error(error);
      showModal("Erro", "Não foi possível salvar.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center text-(--color-text-body) mt-10">
        Carregando perfil...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-6">
      {fromListCode && (
        <Link
          to={`/${fromListCode}`}
          className="mb-4 inline-flex items-center gap-2 text-(--color-text-on-primary) hover:underline font-medium p-2 rounded transition-colors"
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

      {/* CARD */}
      <div className="bg-(--color-card-bg) p-8 rounded-xl shadow transition-colors border border-(--color-border)">
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-(--color-border)">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-(--color-border) shadow-lg mb-4">
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
                <label className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-1 block">
                  Seu Nome de Exibição
                </label>
                {/* Input com a cor de Card Heading */}
                <input
                  type="text"
                  value={profileData.displayName || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      displayName: e.target.value,
                    })
                  }
                  className="text-2xl font-bold text-center w-full bg-transparent border-b-2 border-transparent hover:border-(--color-border) focus:border-(--color-primary) focus:outline-none text-(--color-card-heading) transition-all pb-1 placeholder-gray-300"
                  placeholder="Seu Nome"
                />
              </div>
              <div className="pt-2">
                <label className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-1 block">
                  URL da Foto (Opcional)
                </label>
                <input
                  type="text"
                  value={profileData.photoURL || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, photoURL: e.target.value })
                  }
                  className="text-xs text-center w-full bg-(--color-page-bg) border border-(--color-border) rounded p-2 text-(--color-text-muted) focus:ring-1 focus:ring-(--color-primary) outline-none"
                  placeholder="Cole um link de imagem aqui..."
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              {/* Título com a cor de Card Heading */}
              <h1 className="text-3xl font-bold text-(--color-card-heading)">
                {profileData.displayName || "Usuário sem nome"}
              </h1>
              <p className="text-(--color-text-muted) text-sm mt-1">
                Perfil de Presentes
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-(--color-text-body) mb-1 text-center">
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
              <label className="block text-sm font-medium text-(--color-text-body) mb-1 text-center">
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
              <label className="block text-sm font-medium text-(--color-text-body) mb-1 text-center">
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
            <label className="block text-sm font-medium text-(--color-text-body) mb-2">
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
              placeholder="Chocolate, livros..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-(--color-text-body) mb-2">
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
              placeholder="Uva passa..."
            />
          </div>

          {isMyProfile && (
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full py-3 text-lg font-semibold flex justify-center items-center gap-2"
            >
              {isSaving ? "Atualizando..." : "Salvar Perfil"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
