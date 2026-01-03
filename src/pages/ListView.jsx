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

// --- CONFIGURAÇÕES VISUAIS ---

const COLORS = {
  blue: {
    border: "border-l-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    hover: "hover:text-blue-600 dark:hover:text-blue-300",
  },
  red: {
    border: "border-l-red-500",
    text: "text-red-600 dark:text-red-400",
    hover: "hover:text-red-600 dark:hover:text-red-300",
  },
  green: {
    border: "border-l-green-500",
    text: "text-green-600 dark:text-green-400",
    hover: "hover:text-green-600 dark:hover:text-green-300",
  },
  purple: {
    border: "border-l-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    hover: "hover:text-purple-600 dark:hover:text-purple-300",
  },
  orange: {
    border: "border-l-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    hover: "hover:text-orange-600 dark:hover:text-orange-300",
  },
  pink: {
    border: "border-l-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    hover: "hover:text-pink-600 dark:hover:text-pink-300",
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

// --- HELPERS ---
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

  if (lowerUrl.includes("mercadolivre") || lowerUrl.includes("mercado livre"))
    return {
      name: "Mercado Livre",
      classes:
        "bg-[#ffe600] text-[#2d3277] border-[#e6cf00] hover:bg-[#fff059]",
    };
  if (lowerUrl.includes("amazon"))
    return {
      name: "Amazon",
      classes: "bg-[#232f3e] text-white border-gray-900 hover:bg-[#37475a]",
    };
  if (lowerUrl.includes("shopee"))
    return {
      name: "Shopee",
      classes: "bg-[#ee4d2d] text-white border-[#d03e1f] hover:bg-[#ff684d]",
    };
  if (lowerUrl.includes("magazineluiza") || lowerUrl.includes("magalu"))
    return {
      name: "Magalu",
      classes: "bg-[#0086ff] text-white border-[#0069c9] hover:bg-[#339dff]",
    };
  if (lowerUrl.includes("shein"))
    return {
      name: "Shein",
      classes: "bg-black text-white border-gray-800 hover:bg-gray-800",
    };
  if (lowerUrl.includes("casasbahia"))
    return {
      name: "Casas Bahia",
      classes: "bg-[#002e6e] text-white border-[#001c42] hover:bg-[#1a447f]",
    };
  if (lowerUrl.includes("kabum"))
    return {
      name: "Kabum",
      classes: "bg-[#ff6500] text-white border-[#e55b00] hover:bg-[#ff7a24]",
    };

  const siteName = domain
    ? domain.split(".")[0].charAt(0).toUpperCase() +
      domain.split(".")[0].slice(1)
    : "Visitar Loja";
  return {
    name: siteName,
    classes: "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
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
    if (listData?.code) {
      navigator.clipboard.writeText(listData.code);
      showModal(
        "Código Copiado!",
        `O código ${listData.code} foi copiado.`,
        "success"
      );
    }
  };

  const handleEditItem = (item) => {
    setNewItem({
      name: item.name,
      image: item.image || "",
      link1: item.link1 || "",
      link2: item.link2 || "",
      link3: item.link3 || "",
      price: item.price,
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
        newCategory === "Eletrônicos" ||
        newCategory === "Casa" ||
        newCategory === "Beleza"
          ? prev.voltage
          : "",
    }));
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      showModal(
        "Campos obrigatórios",
        "Preencha o nome e o valor aproximado!",
        "error"
      );
      return;
    }

    const listRef = doc(db, "lists", listData.id);

    try {
      if (editingId) {
        const updatedItems = listData.items.map((item) => {
          if (item.id === editingId) {
            return {
              ...item,
              ...newItem,
              price: parseFloat(newItem.price),
            };
          }
          return item;
        });

        await updateDoc(listRef, { items: updatedItems });
        showModal("Atualizado!", "O item foi editado com sucesso.", "success");
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
      showModal("Erro", "Ocorreu um erro ao salvar.", "error");
    }
  };

  const handleMarkGift = async (itemId) => {
    if (!visitorName.trim()) {
      showModal(
        "Atenção",
        "Por favor, digite seu nome antes de marcar o presente!",
        "error"
      );
      return;
    }
    showModal(
      "Confirmar Presente",
      `Você vai marcar que vai dar este presente como ${visitorName}. Confirmar?`,
      "info",
      async () => {
        const updatedItems = listData.items.map((item) => {
          if (item.id === itemId) return { ...item, giftedBy: visitorName };
          return item;
        });
        const listRef = doc(db, "lists", listData.id);
        await updateDoc(listRef, { items: updatedItems });
        showModal(
          "Obrigado!",
          "O dono da lista vai adorar a surpresa!",
          "success"
        );
      }
    );
  };

  // --- NOVA FUNÇÃO: DESMARCAR PRESENTE ---
  const handleUnmarkGift = async (item) => {
    // Verifica se o visitante digitou o nome correto
    const inputName = visitorName.trim().toLowerCase();
    const gifterName = item.giftedBy.toLowerCase();

    if (inputName !== gifterName) {
      showModal(
        "Ação Bloqueada",
        `Este item foi reservado por "${item.giftedBy}". Para desmarcar, você precisa digitar esse nome exato no campo de visitante acima.`,
        "error"
      );
      return;
    }

    showModal(
      "Liberar Presente?",
      `Você tem certeza que não vai mais dar o item "${item.name}"? Ele ficará disponível para outros.`,
      "info",
      async () => {
        const updatedItems = listData.items.map((i) => {
          if (i.id === item.id) return { ...i, giftedBy: null }; // Remove o nome
          return i;
        });
        const listRef = doc(db, "lists", listData.id);
        await updateDoc(listRef, { items: updatedItems });
        showModal(
          "Item Liberado",
          "O item está disponível novamente na lista.",
          "success"
        );
      }
    );
  };

  const handleMarkReceived = (itemId) => {
    showModal(
      "Já ganhou?",
      "Isso removerá o item da lista permanentemente. Tem certeza?",
      "info",
      async () => {
        const updatedItems = listData.items.filter(
          (item) => item.id !== itemId
        );
        const listRef = doc(db, "lists", listData.id);
        await updateDoc(listRef, { items: updatedItems });
        showModal("Item Removido", "Lista atualizada!", "success");
      }
    );
  };

  const getFilteredItems = () => {
    if (!listData?.items) return [];

    let items = listData.items.filter((item) => {
      if (filterCategory === "Todas") return true;
      const itemCat = item.category || "Outros";
      return itemCat === filterCategory;
    });

    if (sortBy === "value") {
      items.sort((a, b) => a.price - b.price);
    } else {
      const priorityMap = { Alta: 3, Média: 2, Baixa: 1 };
      items.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
    }
    return items;
  };

  if (loading)
    return (
      <div className="p-10 text-center dark:text-white">
        Carregando lista...
      </div>
    );
  if (!listData)
    return (
      <div className="p-10 text-center dark:text-white">
        Lista não encontrada :(
      </div>
    );

  const showSize =
    newItem.category === "Roupas" || newItem.category === "Calçados";
  const showVoltage =
    newItem.category === "Eletrônicos" ||
    newItem.category === "Casa" ||
    newItem.category === "Beleza";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6 border-l-4 ${listTheme.border} transition-colors relative`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">
              {listData.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Criado por:{" "}
              <span className="font-semibold">{listData.ownerName}</span>
            </p>
            {!isOwner && (
              <div className={`mt-2 text-sm ${listTheme.text}`}>
                <Link
                  to={`/perfil?uid=${listData.ownerId}&fromList=${listData.code}`}
                >
                  Ver perfil de gostos de {listData.ownerName}
                </Link>
              </div>
            )}
          </div>
          {isOwner && (
            <div
              onClick={handleCopyCode}
              className={`group flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 ${listTheme.hover} cursor-pointer p-3 rounded-lg transition-all w-full md:w-auto mt-4 md:mt-0`}
              title="Clique para copiar o código"
            >
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1">
                Código da Lista
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-mono font-black text-gray-700 dark:text-white group-hover:${
                    listTheme.text.split(" ")[0]
                  } group-hover:dark:${listTheme.text
                    .split(" ")[1]
                    .replace("dark:", "")}`}
                >
                  {listData.code}
                </span>
                <svg
                  className="w-5 h-5 text-gray-400 transition-colors"
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

      {/* Formulário (Add/Edit) */}
      {isOwner && (
        <div className="mb-8">
          {!isFormOpen ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition flex flex-col items-center gap-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
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
              <span className="font-semibold">Adicionar Novo Presente</span>
            </button>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 modal-animate shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg dark:text-white">
                  {editingId ? "Editar Presente" : "Novo Presente"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  Cancelar
                </button>
              </div>

              <form
                onSubmit={handleSaveItem}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  placeholder="Nome do item (ex: Tênis Nike)"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  placeholder="URL da Foto (Cole aqui)"
                  value={newItem.image}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image: e.target.value })
                  }
                  className="input-field"
                />

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">
                      Categoria
                    </label>
                    <select
                      value={newItem.category}
                      onChange={handleCategoryChange}
                      className="input-field dark:bg-gray-700 dark:text-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showSize && (
                    <div className="animate-fade-in">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">
                        {newItem.category === "Calçados"
                          ? "Tamanho (Nº)"
                          : "Tamanho (P, M, G)"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          newItem.category === "Calçados" ? "Ex: 40" : "Ex: G"
                        }
                        value={newItem.size}
                        onChange={(e) =>
                          setNewItem({ ...newItem, size: e.target.value })
                        }
                        className="input-field border-blue-300 dark:border-blue-700"
                      />
                    </div>
                  )}

                  {showVoltage && (
                    <div className="animate-fade-in">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">
                        Voltagem
                      </label>
                      <select
                        value={newItem.voltage}
                        onChange={(e) =>
                          setNewItem({ ...newItem, voltage: e.target.value })
                        }
                        className="input-field border-yellow-300 dark:border-yellow-700 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        <option value="110v">110v</option>
                        <option value="220v">220v</option>
                        <option value="Bivolt">Bivolt</option>
                        <option value="Pilha/Bateria">Pilha/Bateria</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">
                      Prioridade
                    </label>
                    <select
                      value={newItem.priority}
                      onChange={(e) =>
                        setNewItem({ ...newItem, priority: e.target.value })
                      }
                      className="input-field dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">
                    Links das lojas (Amazon, ML, Shopee...)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      placeholder="Link da Loja 1"
                      value={newItem.link1}
                      onChange={(e) =>
                        setNewItem({ ...newItem, link1: e.target.value })
                      }
                      className="input-field"
                    />
                    <input
                      placeholder="Link da Loja 2"
                      value={newItem.link2}
                      onChange={(e) =>
                        setNewItem({ ...newItem, link2: e.target.value })
                      }
                      className="input-field"
                    />
                    <input
                      placeholder="Link da Loja 3"
                      value={newItem.link3}
                      onChange={(e) =>
                        setNewItem({ ...newItem, link3: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Observações (detalhes adicionais...)"
                  value={newItem.obs}
                  onChange={(e) =>
                    setNewItem({ ...newItem, obs: e.target.value })
                  }
                  className="input-field col-span-1 md:col-span-2"
                />

                <button
                  type="submit"
                  className="btn-primary col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700"
                >
                  {editingId ? "Salvar Alterações" : "Adicionar à Lista"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* BLOCO DE NOME DO VISITANTE */}
      {!isOwner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6 border border-yellow-200 dark:border-yellow-700">
          <label className="block text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-1">
            Olá visitante! Digite seu nome para marcar (ou desmarcar) presentes:
          </label>
          <input
            type="text"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="Seu nome completo"
            className="input-field border-yellow-300 dark:border-yellow-600"
          />
        </div>
      )}

      {/* BARRA DE FILTROS E ORDENAÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Filtrar por:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white cursor-pointer w-full"
          >
            <option value="Todas">Todas as Categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Ordenar:
          </span>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="border dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white cursor-pointer w-full"
          >
            <option value="priority">Por Prioridade</option>
            <option value="value">Por Valor</option>
          </select>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="grid gap-6">
        {getFilteredItems().map((item) => {
          const isGifted = !!item.giftedBy;

          // Verifica se o visitante pode desmarcar (se o nome bater)
          const canUnmark =
            !isOwner &&
            visitorName.trim().length > 0 &&
            item.giftedBy &&
            item.giftedBy.toLowerCase() === visitorName.trim().toLowerCase();

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 ${
                isGifted && !isOwner && !canUnmark
                  ? "opacity-75 grayscale bg-gray-50 dark:bg-gray-900"
                  : ""
              }`}
            >
              <div className="w-full md:w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden relative group">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    Sem imagem
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {item.category || "Outros"}
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
                    {item.name}
                    {item.size && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        Tam: {item.size}
                      </span>
                    )}
                    {item.voltage && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                        {item.voltage}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      R$ {item.price}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded text-white shadow-sm ${
                        item.priority === "Alta"
                          ? "bg-red-500"
                          : item.priority === "Média"
                          ? "bg-orange-400"
                          : "bg-green-500"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm italic border-l-2 border-gray-300 dark:border-gray-600 pl-2">
                  Obs: {item.obs || "Nenhuma observação."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[item.link1, item.link2, item.link3]
                    .filter(Boolean)
                    .map((link, idx) => {
                      const storeInfo = getStoreStyle(link);
                      return (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm border ${storeInfo.classes}`}
                        >
                          <StoreIcon url={link} />
                          {storeInfo.name}
                        </a>
                      );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  {isOwner ? (
                    <div className="flex gap-2 w-full justify-end">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-2 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center gap-1 transition-colors"
                      >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </button>

                      <button
                        onClick={() => handleMarkReceived(item.id)}
                        className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-2 rounded hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1 transition-colors"
                      >
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Já ganhei
                      </button>
                    </div>
                  ) : (
                    <>
                      {isGifted ? (
                        canUnmark ? (
                          // SE O NOME DO VISITANTE BATER, MOSTRA BOTÃO DE DESMARCAR
                          <button
                            onClick={() => handleUnmarkGift(item)}
                            className="text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded border border-red-100 dark:border-red-800 flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            title="Clique para desmarcar"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Desmarcar ({item.giftedBy})
                          </button>
                        ) : (
                          // SE NÃO BATER, MOSTRA APENAS O LABEL ESTÁTICO
                          <span className="text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded border border-gray-200 dark:border-gray-700 flex items-center gap-1">
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Já vão dar ({item.giftedBy})
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleMarkGift(item.id)}
                          className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20"
                        >
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
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

        {getFilteredItems().length === 0 && (
          <div className="text-center py-10">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {filterCategory === "Todas"
                ? "Nenhum item nesta lista ainda."
                : `Nenhum item na categoria "${filterCategory}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
