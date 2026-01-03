import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { GlobalProvider } from "./context/GlobalContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import MyLists from "./pages/MyLists";
import ListView from "./pages/ListView";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
        Carregando...
      </div>
    );

  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout user={user} />}>
            <Route index element={<Home user={user} />} />

            {/* CORREÇÃO: Removemos o bloqueio (user ? ... : ...) para permitir visitantes verem perfis */}
            <Route path="perfil" element={<Profile user={user} />} />

            {/* Minhas Listas continua protegida, pois só dono acessa */}
            <Route
              path="minhas-listas"
              element={user ? <MyLists user={user} /> : <Navigate to="/" />}
            />

            <Route path=":code" element={<ListView user={user} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
