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
    <div className="max-w-2xl mx-auto text-center mt-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
        Crie e Compartilhe sua Lista de Presentes
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
        Organize o que você quer ganhar e ajude seus amigos a não errarem no
        presente!
      </p>

      {/* Busca de Lista para Visitantes */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
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
          <p className="text-gray-500 dark:text-gray-400">Quer criar a sua?</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Faça login no menu superior para começar.
          </p>
        </div>
      )}
    </div>
  );
}
