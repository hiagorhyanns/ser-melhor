import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
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
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/marcas', icon: Tag, label: 'Marcas' },
  { to: '/lojas', icon: Store, label: 'Lojas' },
  { to: '/barba', icon: Scissors, label: 'Barba' },
  { to: '/cabelo', icon: User, label: 'Cabelo' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/roupas', icon: Shirt, label: 'Roupas' },
  { to: '/postura', icon: Accessibility, label: 'Postura' },
  { to: '/musculos', icon: Dumbbell, label: 'Músculos' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1A1A1A] dark:bg-gray-950 dark:text-gray-100">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-gray-100 bg-white p-6 md:flex dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-10 flex items-start justify-between px-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              VESTIR MELHOR
            </h1>
            <p className="mt-1 text-xs font-medium tracking-widest text-gray-400 uppercase dark:text-gray-500">
              Personal Style AI
            </p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-gray-100 dark:text-gray-900 dark:shadow-black/40'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-50 pt-6 dark:border-gray-800">
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
              Dica do dia
            </p>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              Use cores neutras para peças base e deixe tons vibrantes para acessórios.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="flex w-full flex-col md:hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-lg font-bold tracking-tight">VESTIR MELHOR</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="p-2 text-gray-500 dark:text-gray-400"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <nav className="space-y-1 p-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
                        isActive
                          ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                          : 'text-gray-500 dark:text-gray-400',
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-10">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
