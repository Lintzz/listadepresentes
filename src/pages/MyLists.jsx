import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

const COLORS = {
  blue: {
    label: "Azul",
    class: "border-l-blue-500",
    bg: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  },
  red: {
    label: "Vermelho",
    class: "border-l-red-500",
    bg: "bg-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
  green: {
    label: "Verde",
    class: "border-l-green-500",
    bg: "bg-green-500",
    badge:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  },
  purple: {
    label: "Roxo",
    class: "border-l-purple-500",
    bg: "bg-purple-500",
    badge:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  },
  orange: {
    label: "Laranja",
    class: "border-l-orange-500",
    bg: "bg-orange-500",
    badge:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  },
  pink: {
    label: "Rosa",
    class: "border-l-pink-500",
    bg: "bg-pink-500",
    badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
  },
};

export default function MyLists({ user }) {
  const { showModal } = useGlobal();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("blue");
  const [creating, setCreating] = useState(false);
  const [editModal, setEditModal] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    let code = "";
    for (let i = 0; i < 3; i++)
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += "-";
    for (let i = 0; i < 3; i++)
      code += nums.charAt(Math.floor(Math.random() * nums.length));
    return code;
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "lists"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLists(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      const code = generateCode();
      await addDoc(collection(db, "lists"), {
        name: newListName,
        color: newListColor,
        ownerId: user.uid,
        ownerName: user.displayName,
        code: code,
        createdAt: serverTimestamp(),
        items: [],
      });
      setNewListName("");
      setNewListColor("blue");
      showModal("Sucesso", "Lista criada!", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = (listId, listName) => {
    showModal(
      "Excluir Lista",
      `Tem certeza que deseja apagar a lista "${listName}"?`,
      "error",
      async () => {
        try {
          await deleteDoc(doc(db, "lists", listId));
          showModal("Lista Apagada", "Removida com sucesso.", "success");
        } catch (error) {
          console.error(error);
        }
      }
    );
  };

  const openEditModal = (id, currentName) => {
    setEditModal({ open: true, id, name: currentName });
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal.name.trim()) return;
    setIsSavingEdit(true);
    try {
      await updateDoc(doc(db, "lists", editModal.id), { name: editModal.name });
      setEditModal({ open: false, id: null, name: "" });
      showModal("Atualizado", "Nome alterado!", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Título da Página usa a cor padrão */}
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-heading)]">
        Minhas Listas
      </h2>

      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg shadow mb-8 transition-colors border border-[var(--color-border)]">
        <form
          onSubmit={handleCreateList}
          className="flex flex-col md:flex-row gap-4 md:items-end"
        >
          <div className="flex-grow w-full">
            <label className="block text-sm font-medium text-[var(--color-card-heading)] mb-1">
              Nome da Nova Lista
            </label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="input-field"
              placeholder="Ex: Aniversário de 30 anos"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)] font-medium">
              Cor
            </label>
            <div className="flex gap-2">
              {Object.entries(COLORS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewListColor(key)}
                  className={`w-8 h-8 rounded-full ${
                    value.bg
                  } transition-transform hover:scale-110 ${
                    newListColor === key
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : ""
                  }`}
                  title={value.label}
                />
              ))}
            </div>
          </div>

          <button
            disabled={creating}
            type="submit"
            className="btn-primary w-full md:w-auto h-10 self-end hover:opacity-90"
          >
            {creating ? "Criando..." : "Criar"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lists.map((list) => {
          const colorKey = list.color || "blue";
          const theme = COLORS[colorKey] || COLORS.blue;

          return (
            <div
              key={list.id}
              className={`relative group bg-[var(--color-card-bg)] rounded-lg shadow hover:shadow-md transition border-l-[6px] ${theme.class} border-t border-r border-b border-[var(--color-border)]`}
            >
              <Link to={`/${list.code}`} className="block p-6 pb-14">
                <div className="flex justify-between items-start gap-2">
                  {/* CORREÇÃO: Adicionado 'min-w-0 flex-1' para evitar quebra com nomes longos */}
                  <h3 className="text-xl font-bold text-[var(--color-card-heading)] truncate min-w-0 flex-1">
                    {list.name}
                  </h3>
                  <span
                    className={`${theme.badge} text-xs font-bold px-2 py-1 rounded whitespace-nowrap`}
                  >
                    {list.code}
                  </span>
                </div>
                <p className="text-[var(--color-text-muted)] mt-2 text-sm">
                  {list.items?.length || 0} itens na lista
                </p>
              </Link>

              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openEditModal(list.id, list.name);
                  }}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] rounded-full transition cursor-pointer"
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteList(list.id, list.name);
                  }}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error-text)] hover:bg-[var(--color-bg-hover)] rounded-full transition cursor-pointer"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-2xl max-w-sm w-full p-6 modal-animate border border-[var(--color-border)]">
            {/* Modal também é um card */}
            <h3 className="text-xl font-bold text-[var(--color-card-heading)] mb-4 text-center">
              Editar Nome
            </h3>
            <form onSubmit={handleSaveEdit}>
              <div className="mb-6">
                <input
                  type="text"
                  autoFocus
                  className="input-field text-center text-lg"
                  value={editModal.name}
                  onChange={(e) =>
                    setEditModal({ ...editModal, name: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setEditModal({ open: false, id: null, name: "" })
                  }
                  className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isSavingEdit ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
