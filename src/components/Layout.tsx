import React, { useState } from 'react';
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
  PanelLeft,
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

const NAV_ACTIVE = 'bg-[#0C2E2D] text-white';
const NAV_IDLE = 'text-zinc-500 hover:bg-zinc-100 hover:text-[#0C2E2D]';

export function Layout({ children }: { children: React.ReactNode }) {
  // Carrega encolhido (só ícones); botão expande.
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-zinc-100 text-[#0C2E2D]">
      {/* ── Desktop Sidebar (colapsável) ── */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-zinc-200 bg-white transition-all duration-200 md:flex',
          collapsed ? 'w-16' : 'w-56',
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-zinc-100 px-2 py-3',
            collapsed ? 'justify-center' : 'justify-end',
          )}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expandir menu' : 'Encolher menu'}
            title={collapsed ? 'Expandir' : 'Encolher'}
            className="flex h-9 w-9 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#0C2E2D]"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded py-2.5 text-sm font-medium transition-all',
                    collapsed ? 'justify-center px-0' : 'px-3',
                    isActive ? NAV_ACTIVE : NAV_IDLE,
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

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
                  isActive ? 'text-[#0C2E2D]' : 'text-zinc-400',
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
      <main className="min-w-0 flex-1 pb-[68px] md:pb-0">
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
