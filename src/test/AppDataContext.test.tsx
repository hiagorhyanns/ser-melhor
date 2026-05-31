import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppDataProvider, useAppData } from '../contexts/AppDataContext';
import type { Marca, Loja } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppDataProvider>{children}</AppDataProvider>
);

const makeMarca = (id: string, nome: string): Marca => ({
  id,
  nome,
  categoria: 'Esporte',
  observacao: '',
  nivelInteresse: 3,
  favorita: false,
  completed: false,
  createdAt: Date.now(),
});

const makeLoja = (id: string, nome: string): Loja => ({
  id,
  nome,
  link: '',
  categoria: 'Moda',
  faixaPreco: 'Médio',
  observacao: '',
  status: 'ver depois',
  completed: false,
  createdAt: Date.now(),
});

describe('AppDataContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia com dados padrão (postura e músculos populados)', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.data.postura.length).toBeGreaterThan(0);
    expect(result.current.data.marcas).toEqual([]);
  });

  it('addItem insere no início da lista', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.addItem('marcas', makeMarca('1', 'Nike')); });
    act(() => { result.current.addItem('marcas', makeMarca('2', 'Adidas')); });
    expect(result.current.data.marcas[0].nome).toBe('Adidas'); // último adicionado está na frente
  });

  it('updateItem atualiza somente o item correto', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.addItem('marcas', makeMarca('a', 'Nike'));
      result.current.addItem('marcas', makeMarca('b', 'Adidas'));
    });
    act(() => { result.current.updateItem('marcas', 'a', { nome: 'Nike Premium' }); });
    expect(result.current.data.marcas.find((m) => m.id === 'a')?.nome).toBe('Nike Premium');
    expect(result.current.data.marcas.find((m) => m.id === 'b')?.nome).toBe('Adidas'); // intocado
  });

  it('deleteItem remove apenas o item alvo', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.addItem('marcas', makeMarca('del', 'Zara'));
      result.current.addItem('marcas', makeMarca('keep', 'H&M'));
    });
    act(() => { result.current.deleteItem('marcas', 'del'); });
    expect(result.current.data.marcas.find((m) => m.id === 'del')).toBeUndefined();
    expect(result.current.data.marcas.find((m) => m.id === 'keep')).toBeDefined();
  });

  it('toggleComplete move item concluído para o fim', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.addItem('marcas', makeMarca('first', 'A'));
      result.current.addItem('marcas', makeMarca('second', 'B'));
    });
    // Estado: ['B', 'A'] (B foi adicionado por último, vai para frente)
    act(() => { result.current.toggleComplete('marcas', 'second'); }); // completa B
    const ids = result.current.data.marcas.map((m) => m.id);
    expect(ids[ids.length - 1]).toBe('second'); // B no fim
  });

  it('toggleComplete desmarcado volta para o início', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.addItem('marcas', makeMarca('x', 'X')); });
    act(() => { result.current.toggleComplete('marcas', 'x'); }); // completa
    act(() => { result.current.toggleComplete('marcas', 'x'); }); // desmarca
    expect(result.current.data.marcas[0].id).toBe('x');
    expect(result.current.data.marcas[0].completed).toBe(false);
  });

  it('persiste dados no localStorage após mutação', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.addItem('lojas', makeLoja('l1', 'Renner')); });
    const saved = JSON.parse(localStorage.getItem('vestir_melhor_data') ?? '{}') as { lojas?: Loja[] };
    expect(saved.lojas?.[0]?.nome).toBe('Renner');
  });

  it('restaura dados do localStorage na montagem', () => {
    // Pré-popula localStorage
    const preload = { marcas: [makeMarca('pre', 'Pré-carregada')], lojas: [], barba: [], cabelo: [], produtos: [], roupas: [], postura: [], musculos: [] };
    localStorage.setItem('vestir_melhor_data', JSON.stringify(preload));
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.data.marcas[0].nome).toBe('Pré-carregada');
  });

  it('operações em categorias independentes não se afetam', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.addItem('marcas', makeMarca('m1', 'Nike')); });
    act(() => { result.current.addItem('lojas', makeLoja('l1', 'Renner')); });
    act(() => { result.current.deleteItem('marcas', 'm1'); });
    expect(result.current.data.lojas.length).toBe(1); // lojas intocada
    expect(result.current.data.marcas.length).toBe(0);
  });
});
