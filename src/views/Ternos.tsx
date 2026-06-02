import { useState } from 'react';
import { MapPin, Globe, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80';

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = FALLBACK_IMG;
};

const ESTILOS = [
  {
    id: 'americano',
    nome: 'Americano',
    subtitulo: 'Sack Suit / Ivy League',
    origem: '🇺🇸 Estados Unidos',
    imagem:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    descricao:
      'O mais relaxado e confortável. Ombros naturais sem acolchoamento, corpo reto sem marcação de cintura. Nasceu nas universidades Ivy League nos anos 1920. Clássico americano.',
    caracteristicas: [
      'Ombros naturais, sem estrutura rígida',
      'Corpo reto — sem marcar a cintura',
      'Dois ou três botões',
      'Confortável para o dia inteiro',
      'Tecidos mais pesados e duráveis',
    ],
    ideal: 'Trabalho corporativo, reuniões, uso diário, clima quente',
    preco: 'R$ 300 – R$ 1.500',
    lojas: ['Zara Man', 'C&A Linha Social', 'Renner Contemporânea', 'Dafiti.com.br'],
  },
  {
    id: 'italiano',
    nome: 'Italiano',
    subtitulo: 'Stile Italiano — Milão',
    origem: '🇮🇹 Itália',
    imagem:
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
    descricao:
      'Corte slim que valoriza a figura. Ombros levemente acolchoados, axila alta (armhole) e cores ousadas. Referência mundial de elegância. Milão dita as tendências globais há décadas.',
    caracteristicas: [
      'Slim — bem ajustado ao corpo',
      'Ombros com leve estrutura',
      'Axila alta (armhole alto)',
      'Lapelas mais estreitas',
      'Cores e padrões ousados',
    ],
    ideal: 'Eventos, jantares, reuniões importantes, noite',
    preco: 'R$ 800 – R$ 5.000+',
    lojas: ['Hugo Boss', 'Emporio Armani (JK Iguatemi)', 'Aramis', 'Forum'],
  },
  {
    id: 'britanico',
    nome: 'Britânico',
    subtitulo: 'English Cut / Bespoke',
    origem: '🇬🇧 Reino Unido',
    imagem:
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80',
    descricao:
      'Ombros estruturados e retos, cintura bem suprimida, cortes duplos nas costas. Transmite autoridade e poder. A alfaiataria de Savile Row em Londres é a referência máxima.',
    caracteristicas: [
      'Ombros retos e estruturados (padded)',
      'Cintura marcada e suprimida',
      'Dois cortes nas costas (double vent)',
      'Double-breasted é comum nesse estilo',
      'Lã pesada, constrói silhueta',
    ],
    ideal: 'Formatura, casamento, eventos formais, looks de poder',
    preco: 'R$ 1.000 – R$ 8.000+',
    lojas: ['Hugo Boss', 'Lafer', 'Alfaiates sob medida'],
  },
  {
    id: 'napolitano',
    nome: 'Napolitano',
    subtitulo: 'Stile Napoletano — Nápoles',
    origem: '🇮🇹 Itália (Nápoles)',
    imagem:
      'https://images.unsplash.com/photo-1583394293215-01c0cb7d41b0?auto=format&fit=crop&w=600&q=80',
    descricao:
      'A joia da alfaiataria artesanal. Construído sem entretela rígida (unstructured), a manga tem franzido característico — manica a camicia. Costurado à mão, leve como uma segunda pele.',
    caracteristicas: [
      'Construção unstructured (sem entretela)',
      'Manga franzida — manica a camicia',
      'Ombro suave e natural',
      'Pontos de costura visíveis à mão',
      'Levíssimo, molda ao corpo com o uso',
    ],
    ideal: 'Verão, conforto premium, connoisseur de moda',
    preco: 'R$ 2.000 – R$ 15.000+',
    lojas: ['Alfaiates sob medida', 'Freve.com.br', 'Importados'],
  },
  {
    id: 'slim',
    nome: 'Slim Fit',
    subtitulo: 'Corte Moderno Contemporâneo',
    origem: '🌍 Tendência Global',
    imagem:
      'https://images.unsplash.com/photo-1555069519-127aadedf1ee?auto=format&fit=crop&w=600&q=80',
    descricao:
      'Versão contemporânea do clássico. Paletó mais curto, calça estreita e corpo bem ajustado. Popular há duas décadas, ainda é o mais vendido nas lojas brasileiras.',
    caracteristicas: [
      'Paletó mais curto que o clássico',
      'Calça estreita (sem boca de sino)',
      'Corpo muito ajustado',
      'Lapelas mais finas',
      'Versátil: casual ou formal',
    ],
    ideal: 'Jovens, trabalho criativo, eventos modernos, primeiro terno',
    preco: 'R$ 400 – R$ 2.000',
    lojas: ['Zara Man', 'Jack & Jones', 'Forum', 'Cavalera'],
  },
  {
    id: 'duplo',
    nome: 'Duplo Cruzado',
    subtitulo: 'Double Breasted',
    origem: '🇬🇧 Marinha Britânica',
    imagem:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    descricao:
      'Dois filetes de botões frontais. Visual imponente, retro e muito elegante. Voltou à moda com força total e hoje é um dos estilos mais pedidos para festas e eventos.',
    caracteristicas: [
      '4, 6 ou 8 botões em dois filetes',
      'Lapelas pico (peak lapels) — clássicas',
      'Visual imponente e vintage',
      'Geralmente sem colete no look',
      'Estrutura britânica predominante',
    ],
    ideal: 'Casamento, festas, eventos de gala, looks de impacto',
    preco: 'R$ 600 – R$ 4.000',
    lojas: ['Hugo Boss', 'Aramis', 'Forum', 'Lafer'],
  },
];

const PARTES = [
  {
    nome: 'Lapela',
    emoji: '👔',
    tipos: [
      'Notch (Entalhada) — mais comum, casual e versátil',
      'Peak (Pico) — aponta para cima, mais formal e elegante',
      'Shawl (Xale) — arredondada, exclusiva do smoking',
    ],
    dica: 'Para casamentos e eventos formais, Peak lapel é a escolha certa. No dia a dia, Notch é perfeita.',
  },
  {
    nome: 'Botões do Paletó',
    emoji: '🔘',
    tipos: [
      '1 botão — mais formal e elegante, look slim',
      '2 botões — o mais comum, versátil para qualquer ocasião',
      '3 botões — americano/tradicional, mais clássico',
    ],
    dica: 'Regra de ouro: nunca feche o botão de baixo. Em 3 botões, feche só o do meio.',
  },
  {
    nome: 'Bolsos',
    emoji: '🗂️',
    tipos: [
      'Flap (com aba) — casual, prático e mais comum',
      'Welt (embutido) — formal, limpo e elegante',
      'Patch (sobreposto) — casual/esportivo',
      'Ticket pocket (extra pequeno) — britânico e vintage',
    ],
    dica: 'Para eventos formais, welt pocket é o mais correto. O bolso do peito deve ter sempre um lenço.',
  },
  {
    nome: 'Fenda nas Costas',
    emoji: '✂️',
    tipos: [
      'Sem fenda — formal, europeu, perfeito no smoking',
      'Uma fenda central — americano, prático no dia a dia',
      'Duas fendas laterais — britânico, movimentação perfeita',
    ],
    dica: 'Duas fendas são as mais funcionais para quem se movimenta muito e senta com frequência.',
  },
  {
    nome: 'Ombros',
    emoji: '💪',
    tipos: [
      'Natural/Clean — napolitano e americano, confortável',
      'Roped/Pagoda — britânico, sobe levemente na costura',
      'Padded (acolchoado) — italiano, estrutura e define silhueta',
    ],
    dica: 'Ombro natural fica bem em qualquer corpo. Padded ajuda a quem quer aparentar mais estrutura.',
  },
  {
    nome: 'Calça — Comprimento',
    emoji: '👖',
    tipos: [
      'No break — curtinho, moderno, tendência atual',
      'Half break — um dobra leve, clássico e versátil',
      'Full break — tradicional, cai sobre o sapato',
    ],
    dica: 'No break é a tendência do momento. Half break é o mais versátil para qualquer ocasião.',
  },
  {
    nome: 'Entretela (Canvas)',
    emoji: '🧱',
    tipos: [
      'Canvas plena — costurada à mão, molda perfeitamente ao corpo',
      'Half canvas — híbrida, boa relação custo-benefício',
      'Colada (fused) — mais barata, pode descolar com lavagens',
    ],
    dica: 'Sempre pergunte ao vendedor antes de comprar. Half ou full canvas dura muito mais.',
  },
  {
    nome: 'Forro',
    emoji: '🎨',
    tipos: [
      'Viscose — mais comum, levinho e resistente',
      'Seda — premium, muito fresco e escorrega bem',
      'Sem forro (unlined) — ultraleve, ideal para o verão',
    ],
    dica: 'Forro de qualidade é sinal de terno premium. Sempre abra o paletó e sinta o tecido interno.',
  },
];

const TECIDOS = [
  {
    nome: 'Lã Merino',
    subtitulo: 'Super 100s – Super 180s',
    emoji: '🐑',
    estacoes: 'Outono / Inverno / Ano todo (120s+)',
    peso: '220–320 g/m²',
    preco: 'R$$ – R$$$',
    caracteristicas: [
      'O mais elegante e durável para ternos',
      'Molda ao corpo com o uso',
      'Resistente a amassados',
      'Super 100s: melhor custo-benefício',
    ],
    dica: 'Super 100s é o ponto certo. Super 160s+ é ultraleve, ideal até no verão brasileiro.',
    cor: 'bg-zinc-700',
  },
  {
    nome: 'Linho',
    subtitulo: 'Linho Puro ou Misto com Algodão',
    emoji: '🌾',
    estacoes: 'Primavera / Verão',
    peso: '180–240 g/m²',
    preco: 'R$ – R$$',
    caracteristicas: [
      'Fresquíssimo — perfeito para o calor',
      'Amassa (mas faz parte do visual)',
      'Levíssimo e respirável',
      'Visual descontraído e atual',
    ],
    dica: 'Ideal para o verão brasileiro. O amasso é intencional — não tente evitar, é o estilo.',
    cor: 'bg-amber-600',
  },
  {
    nome: 'Cashmere',
    subtitulo: 'Mescla com Lã ou Puro',
    emoji: '✨',
    estacoes: 'Outono / Inverno',
    peso: '280–380 g/m²',
    preco: 'R$$$ – R$$$$',
    caracteristicas: [
      'Ultramacio e luxuoso ao toque',
      'Isolamento térmico superior',
      'Visual e sensação premium',
      'Requer cuidado especial na lavagem',
    ],
    dica: 'Cashmere misturado com lã (ex: 90/10) é o sweet spot — luxo com durabilidade acessível.',
    cor: 'bg-stone-600',
  },
  {
    nome: 'Algodão / Seersucker',
    subtitulo: 'Cotton ou Seersucker',
    emoji: '☁️',
    estacoes: 'Verão / Clima quente',
    peso: '200–280 g/m²',
    preco: 'R$ – R$$',
    caracteristicas: [
      'Confortável e fácil de cuidar',
      'Visual casual e moderno',
      'Seersucker tem textura ondulada',
      'Menos formal que a lã',
    ],
    dica: 'Seersucker listrado é perfeito para casamentos ao ar livre no verão. Visual descontraído chique.',
    cor: 'bg-sky-600',
  },
  {
    nome: 'Tweed',
    subtitulo: 'Harris Tweed / Herringbone',
    emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    estacoes: 'Outono / Inverno',
    peso: '400–600 g/m²',
    preco: 'R$$ – R$$$',
    caracteristicas: [
      'Robusto, pesado e durável',
      'Visual country/britânico único',
      'Textura característica reconhecível',
      'Excelente isolamento térmico',
    ],
    dica: 'Tweed é personalidade. Ótimo para um look diferenciado no inverno — combina com botas.',
    cor: 'bg-green-700',
  },
  {
    nome: 'Mohair / Sharkskin',
    subtitulo: 'Tecidos Especiais para Festas',
    emoji: '🦈',
    estacoes: 'Festas / Eventos noturnos',
    peso: '260–320 g/m²',
    preco: 'R$$$ – R$$$$',
    caracteristicas: [
      'Brilho sutil e característico',
      'Muito elegante para festas noturnas',
      'Mohair: fios de cabra angorá',
      'Cai muito bem no corpo',
    ],
    dica: 'Para festas e eventos noturnos. O brilho é discreto mas o impacto é enorme sob iluminação.',
    cor: 'bg-indigo-700',
  },
];

const LOJAS = [
  {
    nome: 'Hugo Boss',
    tipo: 'Internacional Premium',
    preco: 'R$ 2.500 – R$ 6.000',
    simbolo: 'R$$$',
    estilo: 'Britânico / Italiano',
    onde: 'JK Iguatemi, Iguatemi SP, Shopping Pátio Higienópolis, Iguatemi Campinas, RS',
    site: 'hugoboss.com/br',
    destaques: [
      'Vendedores treinados para medidas',
      'Terno completo com forro de qualidade',
      'Half canvas na maioria dos modelos',
      'Boa gama de tamanhos e cortes',
    ],
    avaliacao: 5,
    cor: 'bg-zinc-900',
  },
  {
    nome: 'Aramis',
    tipo: 'Nacional Premium',
    preco: 'R$ 800 – R$ 2.500',
    simbolo: 'R$$$',
    estilo: 'Italiano / Slim',
    onde: 'Shopping Morumbi, Eldorado, ParkShopping BSB, Campinas, Porto Alegre',
    site: 'aramis.com.br',
    destaques: [
      'Excelente fit para o corpo brasileiro',
      'Linha Platinum com canvas plena',
      'Bom serviço de ajuste no local',
      'Melhor custo-benefício premium nacional',
    ],
    avaliacao: 5,
    cor: 'bg-zinc-800',
  },
  {
    nome: 'Zara Man',
    tipo: 'Fast Fashion Premium',
    preco: 'R$ 500 – R$ 1.200',
    simbolo: 'R$$',
    estilo: 'Slim / Moderno',
    onde: 'Todos os grandes shoppings do Brasil',
    site: 'zara.com/br',
    destaques: [
      'Compra separada — só paletó ou só calça',
      'Tendência atualizada toda estação',
      'Tecidos decentes para o preço',
      'Ótimo para primeiro terno',
    ],
    avaliacao: 4,
    cor: 'bg-zinc-600',
  },
  {
    nome: 'Lafer',
    tipo: 'Nacional Tradicional',
    preco: 'R$ 800 – R$ 2.000',
    simbolo: 'R$$$',
    estilo: 'Britânico / Americano',
    onde: 'Shopping Eldorado, Morumbi, Campinas, Curitiba, Porto Alegre',
    site: 'lafer.com.br',
    destaques: [
      'Marca brasileira consolidada desde 1955',
      'Tecidos importados de qualidade',
      'Corte que funciona bem em homens mais velhos',
      'Durabilidade acima da média',
    ],
    avaliacao: 4,
    cor: 'bg-stone-700',
  },
  {
    nome: 'Forum',
    tipo: 'Nacional Contemporâneo',
    preco: 'R$ 900 – R$ 2.500',
    simbolo: 'R$$$',
    estilo: 'Contemporâneo / Ousado',
    onde: 'JK Iguatemi, Iguatemi SP, Shopping Frei Caneca, Barra Shopping RJ',
    site: 'forum.com.br',
    destaques: [
      'Design nacional de alto nível',
      'Estilo próprio — se destaca',
      'Ótima qualidade de acabamento',
      'Vanguarda da moda masculina brasileira',
    ],
    avaliacao: 4,
    cor: 'bg-zinc-700',
  },
  {
    nome: 'Jack & Jones',
    tipo: 'Europeu Acessível',
    preco: 'R$ 400 – R$ 900',
    simbolo: 'R$$',
    estilo: 'Slim / Europeu',
    onde: 'Shopping Villa-Lobos, Morumbi, ParkShopping BSB, Minas Shopping BH',
    site: 'jackjones.com.br',
    destaques: [
      'Visual europeu moderno sem gastar muito',
      'Bons tecidos mistos para o preço',
      'Slim fit padrão — funciona bem',
      'Boa opção para eventos sem muito orçamento',
    ],
    avaliacao: 4,
    cor: 'bg-blue-700',
  },
  {
    nome: 'Cavalera',
    tipo: 'Nacional Urbano',
    preco: 'R$ 400 – R$ 1.000',
    simbolo: 'R$$',
    estilo: 'Americano / Casual',
    onde: 'Shoppings pelo Brasil — Metrô SP, Campinas, Porto Alegre, Recife',
    site: 'cavalera.com.br',
    destaques: [
      'Marca brasileira de estilo urbano',
      'Boa para ternos mais informais',
      'Variedade de cores e estampas',
      'Acessível para quem está começando',
    ],
    avaliacao: 3,
    cor: 'bg-zinc-600',
  },
  {
    nome: 'Freve (Online)',
    tipo: 'E-commerce Premium',
    preco: 'R$ 600 – R$ 3.000',
    simbolo: 'R$$ – R$$$',
    estilo: 'Todos os estilos',
    onde: 'Online — entrega para todo o Brasil. Loja em São Paulo (SP)',
    site: 'freve.com.br',
    destaques: [
      'Curadoria de marcas e modelos premium',
      'Comparativo de tecidos e caimento online',
      'Devolução facilitada',
      'Ótima para pesquisa antes de ir à loja',
    ],
    avaliacao: 5,
    cor: 'bg-green-700',
  },
];

const DICAS_RAPIDAS = [
  { titulo: 'Tamanho certo', texto: 'O paletó deve cobrir o cinto. Ombro termina exatamente na curva do ombro. Punho da camisa aparece 1,5 cm.' },
  { titulo: 'Regra dos sapatos', texto: 'Oxford ou Derby para formal. Mocassim ou Chelsea boot para smart casual. Nunca tênis com terno de negócios.' },
  { titulo: 'Cores para começar', texto: 'Cinza chumbo e azul marinho são os mais versáteis. Preto é para festas e funerais. Só após ter os 2 primeiros, parta para outras cores.' },
  { titulo: 'Colete', texto: 'Use o colete somente em três peças completas. Com colete, o paletó pode ficar aberto sem problema.' },
];

const FIT_REFS = [
  {
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    legenda: 'Regular Fit — ombro no lugar, corpo sem aperto',
  },
  {
    img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=400&q=80',
    legenda: 'Slim Fit — ajustado, moderno, calça estreita',
  },
  {
    img: 'https://images.unsplash.com/photo-1583394293215-01c0cb7d41b0?auto=format&fit=crop&w=400&q=80',
    legenda: 'Formal — lapela pico, terno completo de evento',
  },
];

const CHECKLIST_PERGUNTAS = [
  'Qual é o tecido? É lã pura ou mistura?',
  'A entretela é canvas ou colada?',
  'O terno tem forro completo ou parcial?',
  'Fazem ajuste (bainha, manga) no local?',
  'Posso comprar o paletó e a calça separados?',
  'Esse modelo está disponível em outros tamanhos?',
  'Qual a política de troca se o ajuste não funcionar?',
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'estilos', label: 'Estilos de Corte' },
  { id: 'anatomia', label: 'Partes do Terno' },
  { id: 'tecidos', label: 'Tecidos' },
  { id: 'lojas', label: 'Lojas Reais' },
  { id: 'dicas', label: 'Dicas Rápidas' },
];

export function Ternos() {
  const [activeTab, setActiveTab] = useState('estilos');

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Guia de Ternos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tudo que você precisa saber antes de entrar em uma loja.
        </p>
      </div>

      {/* Tab nav */}
      <div className="mb-6 flex gap-0 overflow-x-auto border-b border-zinc-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ESTILOS ── */}
      {activeTab === 'estilos' && (
        <div className="space-y-5">
          {ESTILOS.map((estilo) => (
            <div
              key={estilo.id}
              className="overflow-hidden rounded border border-zinc-200 bg-white"
            >
              <div className="grid md:grid-cols-[300px_1fr]">
                <img
                  src={estilo.imagem}
                  alt={estilo.nome}
                  onError={onImgError}
                  className="h-60 w-full object-cover md:h-full"
                />
                <div className="p-5">
                  <p className="mb-0.5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    {estilo.origem}
                  </p>
                  <h2 className="text-xl font-bold text-zinc-900">{estilo.nome}</h2>
                  <p className="mb-3 text-sm text-zinc-500">{estilo.subtitulo}</p>
                  <p className="mb-4 text-sm leading-relaxed text-zinc-600">{estilo.descricao}</p>

                  <div className="mb-4 space-y-1.5">
                    {estilo.caracteristicas.map((c) => (
                      <div key={c} className="flex items-center gap-2 text-xs text-zinc-600">
                        <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
                        {c}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Ideal para
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-zinc-700">{estilo.ideal}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Faixa de preço
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-zinc-700">{estilo.preco}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Onde encontrar
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-zinc-700">
                        {estilo.lojas.join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ANATOMIA ── */}
      {activeTab === 'anatomia' && (
        <div className="space-y-4">
          <div className="rounded border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              💡 Aprenda as partes antes de entrar na loja — assim você conversa como especialista,
              pede o que é certo e evita pagar por algo que não serve.
            </p>
          </div>

          {/* Image reference */}
          <div className="overflow-hidden rounded border border-zinc-200 bg-white">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
              alt="Anatomia do terno"
              className="h-56 w-full object-cover object-top"
            />
            <p className="p-3 text-center text-xs text-zinc-400">
              Referência visual — terno americano clássico de dois botões com lapela entalhada
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PARTES.map((parte) => (
              <div
                key={parte.nome}
                className="rounded border border-zinc-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{parte.emoji}</span>
                  <h3 className="font-bold text-zinc-900">{parte.nome}</h3>
                </div>
                <div className="mb-3 space-y-1.5">
                  {parte.tipos.map((tipo) => (
                    <div key={tipo} className="flex gap-2 text-xs text-zinc-600">
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                      {tipo}
                    </div>
                  ))}
                </div>
                <div className="rounded bg-zinc-50 px-3 py-2.5">
                  <p className="text-xs text-zinc-600">
                    <span className="font-bold text-zinc-900">Dica: </span>
                    {parte.dica}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TECIDOS ── */}
      {activeTab === 'tecidos' && (
        <div className="space-y-4">
          <div className="rounded border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              💡 O tecido define conforto, durabilidade e quando usar o terno. Sempre pergunte ao
              vendedor qual é o tecido antes de qualquer outra coisa.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TECIDOS.map((tecido) => (
              <div
                key={tecido.nome}
                className="overflow-hidden rounded border border-zinc-200 bg-white"
              >
                <div className={cn('flex items-center gap-3 p-4', tecido.cor)}>
                  <span className="text-3xl">{tecido.emoji}</span>
                  <div>
                    <h3 className="font-bold text-white">{tecido.nome}</h3>
                    <p className="text-xs text-white/70">{tecido.subtitulo}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Estações
                      </p>
                      <p className="text-xs font-medium text-zinc-700">{tecido.estacoes}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Peso
                      </p>
                      <p className="text-xs font-medium text-zinc-700">{tecido.peso}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Custo
                      </p>
                      <p className="text-xs font-medium text-zinc-700">{tecido.preco}</p>
                    </div>
                  </div>
                  <div className="mb-3 space-y-1.5">
                    {tecido.caracteristicas.map((c) => (
                      <div key={c} className="flex gap-2 text-xs text-zinc-600">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="rounded bg-zinc-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-600">
                      <span className="font-bold text-zinc-900">Dica: </span>
                      {tecido.dica}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LOJAS ── */}
      {activeTab === 'lojas' && (
        <div className="space-y-4">
          <div className="rounded border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              💡 Lojas reais organizadas por custo-benefício. Chegue ao shopping sabendo exatamente
              aonde ir, o que perguntar e quanto gastar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {LOJAS.map((loja) => (
              <div
                key={loja.nome}
                className="overflow-hidden rounded border border-zinc-200 bg-white"
              >
                <div className={cn('flex items-center justify-between px-5 py-3', loja.cor)}>
                  <div>
                    <h3 className="font-bold text-white">{loja.nome}</h3>
                    <p className="text-xs text-white/70">{loja.tipo}</p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={cn('text-sm', i < loja.avaliacao ? 'text-amber-300' : 'text-white/30')}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Preço
                      </p>
                      <p className="text-xs font-bold text-zinc-900">{loja.simbolo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Faixa
                      </p>
                      <p className="text-xs font-medium text-zinc-700">{loja.preco}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      Estilo
                    </p>
                    <p className="mb-3 text-xs font-medium text-zinc-700">{loja.estilo}</p>
                  </div>

                  <div className="mb-3 flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <p className="text-xs text-zinc-600">{loja.onde}</p>
                  </div>

                  <div className="mb-3 space-y-1.5">
                    {loja.destaques.map((d) => (
                      <div key={d} className="flex gap-2 text-xs text-zinc-600">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                        {d}
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://${loja.site}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 underline underline-offset-2"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {loja.site}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DICAS RÁPIDAS ── */}
      {activeTab === 'dicas' && (
        <div className="space-y-4">
          <div className="rounded border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              💡 Regras rápidas para usar antes de entrar em qualquer loja. Salva este guia no
              celular.
            </p>
          </div>

          {/* Quick tip cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {DICAS_RAPIDAS.map((dica) => (
              <div key={dica.titulo} className="rounded border border-zinc-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-zinc-900">{dica.titulo}</h3>
                <p className="text-sm leading-relaxed text-zinc-600">{dica.texto}</p>
              </div>
            ))}
          </div>

          {/* Fit guide images */}
          <div>
            <h2 className="mb-3 text-base font-bold text-zinc-900">Referências visuais de caimento</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {FIT_REFS.map((ref) => (
                <div key={ref.legenda} className="overflow-hidden rounded border border-zinc-200 bg-white">
                  <img
                    src={ref.img}
                    alt={ref.legenda}
                    onError={onImgError}
                    className="h-52 w-full object-cover object-top"
                  />
                  <p className="p-3 text-xs text-zinc-500">{ref.legenda}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist para o shopping */}
          <div className="rounded border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 font-bold text-zinc-900">✅ Checklist — O que perguntar na loja</h3>
            <div className="space-y-2">
              {CHECKLIST_PERGUNTAS.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-zinc-300">
                    <div className="h-2 w-2 rounded-full bg-transparent" />
                  </div>
                  <p className="text-sm text-zinc-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
