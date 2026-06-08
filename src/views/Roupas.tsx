import { ImageBoardView } from '../components/ImageBoardView';

export function Roupas() {
  return (
    <ImageBoardView
      collection="roupas"
      categoriasKey="roupaCategorias"
      defaultCats={['Básicos', 'Paleta', 'Formalidade', 'Ajustar']}
    />
  );
}
