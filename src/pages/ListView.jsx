import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { useGlobal } from "../context/GlobalContext";

const COLORS = {
  blue: {
    border: "border-l-[var(--list-blue-border)]",
    text: "text-[var(--list-blue-text)]",
    hover: "hover:text-[var(--list-blue-text)]",
  },
  red: {
    border: "border-l-[var(--list-red-border)]",
    text: "text-[var(--list-red-text)]",
    hover: "hover:text-[var(--list-red-text)]",
  },
  green: {
    border: "border-l-[var(--list-green-border)]",
    text: "text-[var(--list-green-text)]",
    hover: "hover:text-[var(--list-green-text)]",
  },
  purple: {
    border: "border-l-[var(--list-purple-border)]",
    text: "text-[var(--list-purple-text)]",
    hover: "hover:text-[var(--list-purple-text)]",
  },
  orange: {
    border: "border-l-[var(--list-orange-border)]",
    text: "text-[var(--list-orange-text)]",
    hover: "hover:text-[var(--list-orange-text)]",
  },
  pink: {
    border: "border-l-[var(--list-pink-border)]",
    text: "text-[var(--list-pink-text)]",
    hover: "hover:text-[var(--list-pink-text)]",
  },
};

const CATEGORIES = [
  "Brinquedos",
  "Lego",
  "Roupas",
  "Calçados",
  "Eletrônicos",
  "Livros",
  "Casa",
  "Beleza",
  "Acessórios",
  "Games",
  "Outros",
];

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch (e) {
    return null;
  }
};

const StoreIcon = ({ url }) => {
  const domain = getDomain(url);
  if (!domain)
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    );
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt="icon"
      className="w-5 h-5 rounded-sm object-contain bg-white p-px"
      onError={(e) => (e.target.style.display = "none")}
    />
  );
};

const getStoreStyle = (url) => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  const domain = getDomain(url);

  if (lowerUrl.includes("mercadolivre"))
    return {
      name: "Mercado Livre",
      classes:
        "bg-[var(--store-ml-bg)] text-[var(--store-ml-text)] border-[var(--store-ml-border)] hover:bg-[var(--store-ml-hover)]",
    };
  if (lowerUrl.includes("amazon"))
    return {
      name: "Amazon",
      classes:
        "bg-[var(--store-amz-bg)] text-[var(--store-amz-text)] border-[var(--store-amz-border)] hover:bg-[var(--store-amz-hover)]",
    };
  if (lowerUrl.includes("shopee"))
    return {
      name: "Shopee",
      classes:
        "bg-[var(--store-shp-bg)] text-[var(--store-shp-text)] border-[var(--store-shp-border)] hover:bg-[var(--store-shp-hover)]",
    };
  if (lowerUrl.includes("magazineluiza"))
    return {
      name: "Magalu",
      classes:
        "bg-[var(--store-mgl-bg)] text-[var(--store-mgl-text)] border-[var(--store-mgl-border)] hover:bg-[var(--store-mgl-hover)]",
    };

  const siteName = domain
    ? domain.split(".")[0].charAt(0).toUpperCase() +
      domain.split(".")[0].slice(1)
    : "Visitar Loja";

  return {
    name: siteName,
    classes:
      "bg-[var(--store-gen-bg)] text-[var(--store-gen-text)] border-[var(--store-gen-border)] hover:bg-[var(--store-gen-hover)]",
  };
};

export default function ListView({ user }) {
  const { code } = useParams();
  const { showModal } = useGlobal();
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para Edição/Criação de item
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    image: "",
    link1: "",
    link2: "",
    link3: "",
    price: "",
    obs: "",
    priority: "Média",
    category: "Outros",
    size: "",
    voltage: "",
  });

  // Estados para Filtro/Ordenação e UX
  const [sortBy, setSortBy] = useState("priority");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const q = query(
        collection(db, "lists"),
        where("code", "==", code.toUpperCase())
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          setListData({ id: docData.id, ...docData.data() });
        } else {
          setListData(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    };
    fetchList();
  }, [code]);

  // Controle do botão "Voltar ao Topo"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isOwner = user && listData && user.uid === listData.ownerId;
  const listTheme =
    listData && COLORS[listData.color || "blue"]
      ? COLORS[listData.color]
      : COLORS.blue;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(listData.code);
    showModal(
      "Código Copiado!",
      `O código ${listData.code} foi copiado.`,
      "success"
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: `Lista de Presentes: ${listData.name}`,
      text: `Veja minha lista de presentes "${listData.name}" no App! Código: ${listData.code}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignorar
      }
    } else {
      handleCopyCode();
    }
  };

  const handleEditItem = (item) => {
    setNewItem({
      ...item,
      image: item.image || "",
      link1: item.link1 || "",
      link2: item.link2 || "",
      link3: item.link3 || "",
      obs: item.obs || "",
      priority: item.priority || "Média",
      category: item.category || "Outros",
      size: item.size || "",
      voltage: item.voltage || "",
    });
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      image: "",
      link1: "",
      link2: "",
      link3: "",
      price: "",
      obs: "",
      priority: "Média",
      category: "Outros",
      size: "",
      voltage: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setNewItem((prev) => ({
      ...prev,
      category: newCategory,
      size:
        newCategory === "Roupas" || newCategory === "Calçados" ? prev.size : "",
      voltage:
        newCategory === "Eletrônicos" || newCategory === "Casa"
          ? prev.voltage
          : "",
    }));
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      showModal("Erro", "Nome e valor são obrigatórios.", "error");
      return;
    }
    const listRef = doc(db, "lists", listData.id);
    try {
      if (editingId) {
        const updatedItems = listData.items.map((item) =>
          item.id === editingId
            ? { ...item, ...newItem, price: parseFloat(newItem.price) }
            : item
        );
        await updateDoc(listRef, { items: updatedItems });
        showModal("Atualizado!", "Item editado.", "success");
      } else {
        const itemToAdd = {
          id: Date.now().toString(),
          ...newItem,
          price: parseFloat(newItem.price),
          giftedBy: null,
          giftedById: null,
        };
        await updateDoc(listRef, { items: arrayUnion(itemToAdd) });
        showModal("Sucesso!", "Item adicionado.", "success");
      }
      resetForm();
    } catch (error) {
      console.error(error);
      showModal("Erro", "Erro ao salvar.", "error");
    }
  };

  // --- Lógica de Dar Presente (Visitante) ---

  const checkUserProfileName = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().name) {
        return userSnap.data().name;
      }
    } catch (error) {
      console.error("Erro ao buscar nome:", error);
    }
    return null;
  };

  // Função chamada ao clicar em "Vou dar este presente"
  const handleMarkGiftClick = async (itemId) => {
    let currentUser = user;

    try {
      // 1. Se não estiver logado, faz login
      if (!currentUser) {
        googleProvider.setCustomParameters({ prompt: "select_account" });
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
      }

      // 2. Verifica se o usuário tem nome
      const profileName = await checkUserProfileName(currentUser.uid);

      if (!profileName) {
        // Se não tem nome, o Layout.jsx deve estar abrindo o Modal Global agora.
        showModal(
          "Complete seu perfil",
          "Por favor, salve seu nome na janela que apareceu para continuar.",
          "info"
        );
      } else {
        // 3. Se já tem nome, executa
        confirmMarkGift(itemId, profileName, currentUser.uid);
      }
    } catch (error) {
      console.error(error);
      if (error.code !== "auth/popup-closed-by-user") {
        showModal("Erro", "Falha ao processar login.", "error");
      }
    }
  };

  const confirmMarkGift = (itemId, giverName, giverId) => {
    showModal(
      "Confirmar",
      `Marcar presente como ${giverName}?`,
      "info",
      async () => {
        try {
          const updatedItems = listData.items.map((item) =>
            item.id === itemId
              ? { ...item, giftedBy: giverName, giftedById: giverId }
              : item
          );
          await updateDoc(doc(db, "lists", listData.id), {
            items: updatedItems,
          });
          showModal("Obrigado!", "Presente marcado com sucesso!", "success");
        } catch (error) {
          console.error("Erro ao marcar presente:", error);
          showModal(
            "Erro",
            "Permissão negada ou erro de rede. Verifique se você está logado.",
            "error"
          );
        }
      }
    );
  };

  // Desmarcar presente (Visitante - apenas o próprio)
  const handleUnmarkGift = async (item) => {
    if (!user || (item.giftedById && item.giftedById !== user.uid)) {
      // Fallback para verificar por nome se for legado
      const currentName = await checkUserProfileName(user?.uid);
      if (!user || item.giftedBy !== currentName) {
        showModal(
          "Atenção",
          "Você só pode desmarcar presentes que você marcou.",
          "error"
        );
        return;
      }
    }

    showModal(
      "Liberar?",
      "Tem certeza que deseja desmarcar?",
      "info",
      async () => {
        const updatedItems = listData.items.map((i) =>
          i.id === item.id ? { ...i, giftedBy: null, giftedById: null } : i
        );
        await updateDoc(doc(db, "lists", listData.id), { items: updatedItems });
        showModal("Liberado", "Item disponível novamente.", "success");
      }
    );
  };

  // --- Lógica do Dono ---

  const handleMarkReceived = (itemId) => {
    showModal(
      "Já ganhou?",
      "Isso remove o item da lista permanentemente.",
      "info",
      async () => {
        const updatedItems = listData.items.filter(
          (item) => item.id !== itemId
        );
        await updateDoc(doc(db, "lists", listData.id), { items: updatedItems });
      }
    );
  };

  const handleOwnerUnmark = (itemId) => {
    showModal(
      "Não ganhou?",
      "Isso irá desmarcar o presente e deixá-lo disponível na lista novamente.",
      "info",
      async () => {
        const updatedItems = listData.items.map((item) =>
          item.id === itemId
            ? { ...item, giftedBy: null, giftedById: null }
            : item
        );
        await updateDoc(doc(db, "lists", listData.id), { items: updatedItems });
        showModal("Atualizado", "Item disponível novamente.", "success");
      }
    );
  };

  const getFilteredItems = () => {
    if (!listData?.items) return [];
    let items = listData.items.filter(
      (item) =>
        filterCategory === "Todas" ||
        (item.category || "Outros") === filterCategory
    );
    if (sortBy === "value") items.sort((a, b) => a.price - b.price);
    else {
      const pMap = { Alta: 3, Média: 2, Baixa: 1 };
      items.sort((a, b) => pMap[b.priority] - pMap[a.priority]);
    }
    return items;
  };

  if (loading)
    return (
      <div className="p-10 text-center text-(--color-text-body)">
        Carregando lista...
      </div>
    );
  if (!listData)
    return (
      <div className="p-10 text-center text-(--color-text-body)">
        Lista não encontrada :(
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto relative pb-16">
      {/* Header da Lista - CARD */}
      <div
        className={`bg-(--color-card-bg) p-4 md:p-6 rounded-xl shadow-sm mb-6 border-l-4 ${listTheme.border} transition-colors border border-(--color-border)`}
      >
        <div className="flex flex-row justify-between items-start gap-2 md:gap-4">
          <div className="min-w-0 pr-2">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-(--color-card-heading) wrap-break-word leading-tight">
              {listData.name}
            </h1>
            <p className="text-xs md:text-base text-(--color-text-muted)">
              Criado por:{" "}
              <span className="font-semibold text-(--color-text-body)">
                {listData.ownerName}
              </span>
            </p>
            {!isOwner && (
              <div
                className={`mt-1 md:mt-2 text-xs md:text-sm text-(--color-border)`}
              >
                <Link
                  to={`/perfil?uid=${listData.ownerId}&fromList=${listData.code}`}
                >
                  Ver perfil
                </Link>
              </div>
            )}
          </div>

          {/* Área Código e Compartilhar - LADO DIREITO */}
          <div className="flex flex-row items-center gap-2 shrink-0">
            {isOwner && (
              <div
                onClick={handleCopyCode}
                className={`group flex flex-col items-center justify-center bg-(--color-page-bg) hover:bg-(--color-bg-hover) border-2 border-dashed border-(--color-border) cursor-pointer p-2 md:p-3 rounded-lg transition-all`}
              >
                <span className="text-[10px] md:text-xs font-bold text-(--color-text-muted) uppercase tracking-widest mb-0.5 md:mb-1">
                  Código
                </span>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-lg md:text-2xl font-mono font-black text-(--code-text-default) group-hover:text-(--color-card-heading) transition-colors">
                    {listData.code}
                  </span>
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-(--color-text-muted)"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}

            <button
              onClick={handleShare}
              className="flex items-center justify-center bg-(--color-page-bg) hover:bg-(--color-bg-hover) border border-(--color-border) p-2 md:p-3 rounded-lg transition-all cursor-pointer text-(--color-text-muted) hover:text-(--color-primary) h-full aspect-square"
              title="Compartilhar Lista"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Formulário - CARD (Apenas Owner) */}
      {isOwner && (
        <div className="mb-8">
          {!isFormOpen ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-4 border-2 border-dashed border-(--color-border) rounded-xl text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary) transition flex flex-col items-center gap-2 bg-transparent hover:bg-(--color-bg-hover)"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="font-semibold">Adicionar Presente</span>
            </button>
          ) : (
            <div className="bg-(--color-card-bg) p-6 rounded-xl border border-(--color-border) modal-animate shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-(--color-card-heading)">
                  {editingId ? "Editar" : "Novo"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-(--color-card-heading) hover:text-(--prio-high)"
                >
                  Cancelar
                </button>
              </div>
              <form
                onSubmit={handleSaveItem}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  maxLength={50}
                  placeholder="Nome do item"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  placeholder="URL da Foto"
                  value={newItem.image}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image: e.target.value })
                  }
                  className="input-field"
                />
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-(--color-text-muted) font-bold block mb-1">
                      Categoria
                    </label>
                    <select
                      value={newItem.category}
                      onChange={handleCategoryChange}
                      className="input-field"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(newItem.category === "Roupas" ||
                    newItem.category === "Calçados") && (
                    <div>
                      <label className="text-xs text-(--color-text-muted) font-bold block mb-1">
                        Tamanho
                      </label>
                      <input
                        value={newItem.size}
                        onChange={(e) =>
                          setNewItem({ ...newItem, size: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                  )}
                  {["Eletrônicos", "Casa", "Beleza"].includes(
                    newItem.category
                  ) && (
                    <div>
                      <label className="text-xs text-(--color-text-muted) font-bold block mb-1">
                        Voltagem
                      </label>
                      <select
                        value={newItem.voltage}
                        onChange={(e) =>
                          setNewItem({ ...newItem, voltage: e.target.value })
                        }
                        className="input-field"
                      >
                        <option value="">Selecione...</option>
                        <option value="110v">110v</option>
                        <option value="220v">220v</option>
                        <option value="Bivolt">Bivolt</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-(--color-text-muted) font-bold block mb-1">
                      Prioridade
                    </label>
                    <select
                      value={newItem.priority}
                      onChange={(e) =>
                        setNewItem({ ...newItem, priority: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-(--color-text-muted) font-bold block mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-(--color-text-muted) font-semibold mb-1">
                    Links
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Link 1"
                      value={newItem.link1}
                      onChange={(e) =>
                        setNewItem({ ...newItem, link1: e.target.value })
                      }
                      className="input-field"
                    />
                    <input
                      placeholder="Link 2"
                      value={newItem.link2}
                      onChange={(e) =>
                        setNewItem({ ...newItem, link2: e.target.value })
                      }
                      className="input-field"
                    />
                    <input
                      placeholder="Link 3"
                      value={newItem.link3}
                      onChange={(e) =>
                        setNewItem({ ...newItem, link3: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Observações"
                  value={newItem.obs}
                  onChange={(e) =>
                    setNewItem({ ...newItem, obs: e.target.value })
                  }
                  className="input-field col-span-1 md:col-span-2"
                />
                <button
                  type="submit"
                  className="btn-primary col-span-1 md:col-span-2"
                >
                  {editingId ? "Salvar" : "Adicionar"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Filtros - CARD */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-(--color-card-bg) p-3 rounded-lg border border-(--color-border)">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-semibold text-(--color-text-muted)">
            Filtrar:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field py-2 text-sm bg-(--color-page-bg)"
          >
            <option value="Todas">Todas</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-(--color-text-muted)">Ordenar:</span>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2 text-sm bg-(--color-page-bg)"
          >
            <option value="priority">Prioridade</option>
            <option value="value">Valor</option>
          </select>
        </div>
      </div>

      {/* Lista de Itens - CARDS */}
      <div className="grid gap-6">
        {getFilteredItems().map((item) => {
          const isGifted = !!item.giftedBy;

          // Verifica se o usuário atual é quem deu o presente
          const isGiver =
            user &&
            (item.giftedById === user.uid ||
              (!item.giftedById && item.giftedBy));

          return (
            <div
              key={item.id}
              className={`bg-(--color-card-bg) p-6 rounded-xl shadow border border-(--color-border) flex flex-col md:flex-row gap-6 ${
                isGifted && !isOwner && !isGiver
                  ? "opacity-70 grayscale bg-(--color-border)"
                  : ""
              }`}
            >
              <div className="w-full md:w-48 h-48 bg-(--color-page-bg) rounded-lg shrink-0 overflow-hidden relative group">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-(--color-text-muted)">
                    Sem imagem
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {item.category}
                </div>
              </div>
              <div className="grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-(--color-card-heading) flex items-center gap-2 flex-wrap break-all">
                    {item.name}

                    {item.size && (
                      <span className="text-xs bg-(--tag-size-bg) text-(--tag-size-text) px-2 py-0.5 rounded">
                        Tam: {item.size}
                      </span>
                    )}

                    {item.voltage && (
                      <span className="text-xs bg-(--tag-volt-bg) text-(--tag-volt-text) px-2 py-0.5 rounded">
                        {item.voltage}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-bold text-(--color-card-heading) whitespace-nowrap">
                      R$ {item.price}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded text-(--prio-text) ${
                        item.priority === "Alta"
                          ? "bg-(--prio-high)"
                          : item.priority === "Média"
                          ? "bg-(--prio-med)"
                          : "bg-(--prio-low)"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
                <p className="text-(--color-text-muted) mt-2 text-sm italic border-l-2 border-(--color-border) pl-2">
                  Obs: {item.obs || "Nenhuma."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[item.link1, item.link2, item.link3]
                    .filter(Boolean)
                    .map((link, idx) => {
                      const sInfo = getStoreStyle(link);
                      return (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${sInfo.classes}`}
                        >
                          <StoreIcon url={link} />
                          {sInfo.name}
                        </a>
                      );
                    })}
                </div>
                <div className="mt-6 pt-4 border-t border-(--color-border) flex flex-wrap gap-2 justify-between items-center">
                  {isOwner ? (
                    <div className="flex gap-2 w-full justify-end flex-wrap">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-sm bg-(--color-info-bg) text-(--color-info-text) px-3 py-2 rounded hover:opacity-80 transition"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleOwnerUnmark(item.id)}
                        className="text-sm bg-(--color-error-bg) text-(--color-error-text) px-3 py-2 rounded hover:opacity-80 transition"
                      >
                        Não ganhei
                      </button>

                      <button
                        onClick={() => handleMarkReceived(item.id)}
                        className="text-sm bg-(--color-success-bg) text-(--color-success-text) px-3 py-2 rounded hover:opacity-80 transition"
                      >
                        Já ganhei
                      </button>
                    </div>
                  ) : (
                    <>
                      {isGifted ? (
                        isGiver ? (
                          <button
                            onClick={() => handleUnmarkGift(item)}
                            className="text-(--color-error-text) font-bold bg-(--color-error-bg) px-3 py-1 rounded border border-(--color-error-bg)/50 hover:opacity-80 transition"
                          >
                            Desmarcar (Você vai dar)
                          </button>
                        ) : (
                          <span className="text-(--color-text-muted) font-bold bg-(--color-page-bg) px-3 py-1 rounded border border-(--color-border)">
                            Já vão dar ({item.giftedBy})
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleMarkGiftClick(item.id)}
                          className="btn-primary bg-(--color-success-text) hover:opacity-80 w-full md:w-auto"
                        >
                          Vou dar este presente!
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-(--color-header-bg) text-(--color-text-body) border border-(--color-border)  shadow-lg z-40 transition-all duration-300 transform ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
        title="Voltar ao topo"
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
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}
