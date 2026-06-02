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
  Briefcase,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { to: '/roupas', icon: Shirt, label: 'Roupas' },
  { to: '/ternos', icon: Briefcase, label: 'Ternos' },
  { to: '/lojas', icon: Store, label: 'Lojas' },
  { to: '/barba', icon: Scissors, label: 'Barba' },
  { to: '/cabelo', icon: User, label: 'Cabelo' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/marcas', icon: Tag, label: 'Marcas' },
  { to: '/postura', icon: Accessibility, label: 'Postura' },
  { to: '/musculos', icon: Dumbbell, label: 'Músculos' },
];

const NAV_ACTIVE = 'bg-zinc-900 text-white';
const NAV_IDLE = 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      {/* ── Desktop Sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
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

      {/* ── Mobile Top Header ── */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white md:hidden">
        <header className="flex items-center justify-center px-4 py-3">
          <h1 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">
            Ser Melhor
          </h1>
        </header>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <nav
          className="flex overflow-x-auto bg-white [&::-webkit-scrollbar]:hidden"
          style={{ boxShadow: '0 -1px 0 0 #e4e4e7' }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[64px] flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-colors',
                  isActive ? 'text-zinc-900' : 'text-zinc-400',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Main content ── */}
      <main className="min-w-0 flex-1 pt-[49px] pb-[68px] md:pb-0 md:pt-0">
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
