import { Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-slate-900">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
        Bretosolution
      </h1>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
