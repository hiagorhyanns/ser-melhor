import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Tag,
  Store,
  Scissors,
  User,
  Package,
  Shirt,
  Accessibility,
  Dumbbell,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { to: '/marcas', icon: Tag, label: 'Marcas' },
  { to: '/lojas', icon: Store, label: 'Lojas' },
  { to: '/barba', icon: Scissors, label: 'Barba' },
  { to: '/cabelo', icon: User, label: 'Cabelo' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/roupas', icon: Shirt, label: 'Roupas' },
  { to: '/postura', icon: Accessibility, label: 'Postura' },
  { to: '/musculos', icon: Dumbbell, label: 'Músculos' },
];

const NAV_ACTIVE = 'bg-zinc-900 text-white';
const NAV_IDLE = 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      {/* ── Desktop Sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-56 flex-shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h1 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">
            Ser Melhor
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all',
                    isActive ? NAV_ACTIVE : NAV_IDLE,
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {/* ── Mobile header + nav ── */}
      <div className="fixed inset-x-0 top-0 z-50 md:hidden">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <h1 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">
            Ser Melhor
          </h1>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-[49px] bg-black/30"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="relative border-b border-zinc-200 bg-white"
              >
                <nav className="grid grid-cols-2 gap-1 p-3">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 rounded px-3 py-2.5 text-sm font-medium transition-all',
                          isActive ? NAV_ACTIVE : NAV_IDLE,
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main content ── */}
      <main className="min-w-0 flex-1 pt-[49px] md:pt-0">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
