import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  onSnapshot,
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
      className="w-5 h-5 rounded-sm object-contain bg-white p-[1px]"
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

  // Genérico
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
  const [visitorName, setVisitorName] = useState("");
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
  const [sortBy, setSortBy] = useState("priority");
  const [filterCategory, setFilterCategory] = useState("Todas");

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

  const handleMarkGift = async (itemId) => {
    if (!visitorName.trim()) {
      showModal("Atenção", "Digite seu nome antes de marcar!", "error");
      return;
    }
    showModal(
      "Confirmar",
      `Marcar presente como ${visitorName}?`,
      "info",
      async () => {
        const updatedItems = listData.items.map((item) =>
          item.id === itemId ? { ...item, giftedBy: visitorName } : item
        );
        await updateDoc(doc(db, "lists", listData.id), { items: updatedItems });
        showModal("Obrigado!", "Dono notificado!", "success");
      }
    );
  };

  const handleUnmarkGift = async (item) => {
    if (visitorName.trim().toLowerCase() !== item.giftedBy.toLowerCase()) {
      showModal(
        "Bloqueado",
        `Digite o nome exato: "${item.giftedBy}"`,
        "error"
      );
      return;
    }
    showModal("Liberar?", "Tem certeza?", "info", async () => {
      const updatedItems = listData.items.map((i) =>
        i.id === item.id ? { ...i, giftedBy: null } : i
      );
      await updateDoc(doc(db, "lists", listData.id), { items: updatedItems });
      showModal("Liberado", "Item disponível novamente.", "success");
    });
  };

  const handleMarkReceived = (itemId) => {
    showModal(
      "Já ganhou?",
      "Isso remove o item da lista.",
      "info",
      async () => {
        const updatedItems = listData.items.filter(
          (item) => item.id !== itemId
        );
        await updateDoc(doc(db, "lists", listData.id), { items: updatedItems });
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
      <div className="p-10 text-center text-[var(--color-text-body)]">
        Carregando lista...
      </div>
    );
  if (!listData)
    return (
      <div className="p-10 text-center text-[var(--color-text-body)]">
        Lista não encontrada :(
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header da Lista - CARD */}
      <div
        className={`bg-[var(--color-card-bg)] p-6 rounded-xl shadow-sm mb-6 border-l-4 ${listTheme.border} transition-colors border border-[var(--color-border)]`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[var(--color-card-heading)]">
              {listData.name}
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Criado por:{" "}
              <span className="font-semibold text-[var(--color-text-body)]">
                {listData.ownerName}
              </span>
            </p>
            {!isOwner && (
              <div className={`mt-2 text-sm text-[var(--color-border)]`}>
                <Link
                  to={`/perfil?uid=${listData.ownerId}&fromList=${listData.code}`}
                >
                  Ver perfil de {listData.ownerName}
                </Link>
              </div>
            )}
          </div>
          {isOwner && (
            <div
              onClick={handleCopyCode}
              className={`group flex flex-col items-center justify-center bg-[var(--color-page-bg)] hover:bg-[var(--color-bg-hover)] border-2 border-dashed border-[var(--color-border)] cursor-pointer p-3 rounded-lg transition-all w-full md:w-auto mt-4 md:mt-0`}
            >
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
                Código
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-black text-[var(--code-text-default)] group-hover:text-[var(--color-card-heading)] transition-colors">
                  {listData.code}
                </span>
                <svg
                  className="w-5 h-5 text-[var(--color-text-muted)]"
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
        </div>
      </div>

      {/* Formulário - CARD */}
      {isOwner && (
        <div className="mb-8">
          {!isFormOpen ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-4 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition flex flex-col items-center gap-2 bg-transparent hover:bg-[var(--color-bg-hover)]"
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
            <div className="bg-[var(--color-card-bg)] p-6 rounded-xl border border-[var(--color-border)] modal-animate shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-[var(--color-card-heading)]">
                  {editingId ? "Editar" : "Novo"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-error-text)]"
                >
                  Cancelar
                </button>
              </div>
              <form
                onSubmit={handleSaveItem}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  maxLength={50} // ADICIONADO: Limite para nome do item
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
                    <label className="text-xs text-[var(--color-text-muted)] font-bold block mb-1">
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
                      <label className="text-xs text-[var(--color-text-muted)] font-bold block mb-1">
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
                      <label className="text-xs text-[var(--color-text-muted)] font-bold block mb-1">
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
                    <label className="text-xs text-[var(--color-text-muted)] font-bold block mb-1">
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
                    <label className="text-xs text-[var(--color-text-muted)] font-bold block mb-1">
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
                  <p className="text-xs text-[var(--color-text-muted)] font-semibold mb-1">
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

      {/* Área Visitante */}
      {!isOwner && (
        <div className="bg-[var(--color-card-bg)] p-4 rounded-lg mb-6 border border-[var(--color-border)]">
          <label className="block text-sm font-bold text-[var(--color-card-heading)] mb-1">
            Olá visitante! Seu nome:
          </label>
          <input
            maxLength={25}
            type="text"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="Seu nome completo"
            className="input-field"
          />
        </div>
      )}

      {/* Filtros - CARD */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-[var(--color-card-bg)] p-3 rounded-lg border border-[var(--color-border)]">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-semibold text-[var(--color-text-muted)]">
            Filtrar:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field py-2 text-sm bg-[var(--color-page-bg)]"
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
          <span className="text-sm text-[var(--color-text-muted)]">
            Ordenar:
          </span>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2 text-sm bg-[var(--color-page-bg)]"
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
          const canUnmark =
            !isOwner &&
            visitorName.trim().length > 0 &&
            item.giftedBy &&
            item.giftedBy.toLowerCase() === visitorName.trim().toLowerCase();
          return (
            <div
              key={item.id}
              className={`bg-[var(--color-card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)] flex flex-col md:flex-row gap-6 ${
                isGifted && !isOwner && !canUnmark
                  ? "opacity-70 grayscale bg-[var(--color-border)]"
                  : ""
              }`}
            >
              <div className="w-full md:w-48 h-48 bg-[var(--color-page-bg)] rounded-lg flex-shrink-0 overflow-hidden relative group">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                    Sem imagem
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {item.category}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  {/* ADICIONADO: break-all para não estourar com palavras longas */}
                  <h3 className="text-xl font-bold text-[var(--color-card-heading)] flex items-center gap-2 flex-wrap break-all">
                    {item.name}

                    {item.size && (
                      <span className="text-xs bg-[var(--tag-size-bg)] text-[var(--tag-size-text)] px-2 py-0.5 rounded">
                        Tam: {item.size}
                      </span>
                    )}

                    {item.voltage && (
                      <span className="text-xs bg-[var(--tag-volt-bg)] text-[var(--tag-volt-text)] px-2 py-0.5 rounded">
                        {item.voltage}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    {/* ADICIONADO: whitespace-nowrap para não quebrar o valor */}
                    <span className="text-lg font-bold text-[var(--color-card-heading)] whitespace-nowrap">
                      R$ {item.price}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded text-[var(--prio-text)] ${
                        item.priority === "Alta"
                          ? "bg-[var(--prio-high)]"
                          : item.priority === "Média"
                          ? "bg-[var(--prio-med)]"
                          : "bg-[var(--prio-low)]"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
                <p className="text-[var(--color-text-muted)] mt-2 text-sm italic border-l-2 border-[var(--color-border)] pl-2">
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
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${sInfo.classes}`}
                        >
                          <StoreIcon url={link} />
                          {sInfo.name}
                        </a>
                      );
                    })}
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                  {isOwner ? (
                    <div className="flex gap-2 w-full justify-end">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-sm bg-[var(--color-info-bg)] text-[var(--color-info-text)] px-3 py-2 rounded hover:opacity-80 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleMarkReceived(item.id)}
                        className="text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] px-3 py-2 rounded hover:opacity-80 transition"
                      >
                        Já ganhei
                      </button>
                    </div>
                  ) : (
                    <>
                      {isGifted ? (
                        canUnmark ? (
                          <button
                            onClick={() => handleUnmarkGift(item)}
                            className="text-[var(--color-error-text)] font-bold bg-[var(--color-error-bg)] px-3 py-1 rounded border border-[var(--color-error-bg)]/50 hover:opacity-80"
                          >
                            Desmarcar ({item.giftedBy})
                          </button>
                        ) : (
                          <span className="text-[var(--color-text-muted)] font-bold bg-[var(--color-page-bg)] px-3 py-1 rounded border border-[var(--color-border)]">
                            Já vão dar ({item.giftedBy})
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleMarkGift(item.id)}
                          className="btn-primary bg-[var(--color-success-text)] hover:bg-green-700"
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
    </div>
  );
}
