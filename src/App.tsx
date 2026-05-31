import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

const Marcas = lazy(() => import('./views/Marcas').then((m) => ({ default: m.Marcas })));
const Lojas = lazy(() => import('./views/Lojas').then((m) => ({ default: m.Lojas })));
const Barba = lazy(() => import('./views/Barba').then((m) => ({ default: m.Barba })));
const Cabelo = lazy(() => import('./views/Cabelo').then((m) => ({ default: m.Cabelo })));
const Produtos = lazy(() => import('./views/Produtos').then((m) => ({ default: m.Produtos })));
const Roupas = lazy(() => import('./views/Roupas').then((m) => ({ default: m.Roupas })));
const Postura = lazy(() => import('./views/Postura').then((m) => ({ default: m.Postura })));
const Musculos = lazy(() => import('./views/Musculos').then((m) => ({ default: m.Musculos })));
const Ternos = lazy(() => import('./views/Ternos').then((m) => ({ default: m.Ternos })));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/marcas" replace />} />
            <Route path="/marcas" element={<Marcas />} />
            <Route path="/lojas" element={<Lojas />} />
            <Route path="/barba" element={<Barba />} />
            <Route path="/cabelo" element={<Cabelo />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/roupas" element={<Roupas />} />
            <Route path="/postura" element={<Postura />} />
            <Route path="/musculos" element={<Musculos />} />
            <Route path="/ternos" element={<Ternos />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
