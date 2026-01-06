import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ user }) {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/${code.toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center mt-10 px-4">
      {/* Título da Página (Mantém a cor geral) */}
      <h1 className="text-4xl font-bold mb-6 text-(--color-text-heading)">
        Crie e Compartilhe sua Lista de Presentes
      </h1>
      <p className="text-(--color-text-muted) mb-8 text-lg">
        Organize o que você quer ganhar e ajude seus amigos a não errarem no
        presente!
      </p>

      {/* CARD */}
      <div className="bg-(--color-card-bg) p-8 rounded-xl shadow-lg border border-(--color-border)">
        {/* CORREÇÃO: Usando a nova cor de título de card */}
        <h2 className="text-2xl font-semibold mb-4 text-(--color-card-heading)">
          Tem um código de lista?
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Ex: HQR-832"
            className="input-field text-center uppercase tracking-widest text-lg"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {!user && (
        <div className="mt-12">
          <p className="text-(--color-text-muted)">Quer criar a sua?</p>
          <p className="text-sm text-(--color-text-muted) opacity-80">
            Faça login no menu superior para começar.
          </p>
        </div>
      )}
    </div>
  );
}
