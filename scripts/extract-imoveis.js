import fs from 'fs';
import path from 'path';

const sourceDir = path.resolve(process.cwd(), 'data-imoveis');
const publicDir = path.resolve(process.cwd(), 'public', 'imoveis');
const dataDir = path.resolve(process.cwd(), 'src', 'data');
const dataFile = path.join(dataDir, 'imoveis.ts');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const construtoras = fs.readdirSync(sourceDir).filter(item => fs.statSync(path.join(sourceDir, item)).isDirectory());

const imoveis = [];

for (const construtora of construtoras) {
  const construtoraDir = path.join(sourceDir, construtora);
  const empreendimentos = fs.readdirSync(construtoraDir).filter(item => fs.statSync(path.join(construtoraDir, item)).isDirectory());

  for (const empreendimento of empreendimentos) {
    const empreendimentoDir = path.join(construtoraDir, empreendimento);
    console.log(`Processando: ${construtora} -> ${empreendimento}`);
    
    // Configura infos base
    const slug = empreendimento.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let itemData = {
      id: slug,
      nome: empreendimento,
      construtora: construtora,
      imagens: [],
      descricao: '',
      preco: 'Consulte',
      detalhes: []
    };

    // Copiar imagens e listar
    const publicEmpreendimentoDir = path.join(publicDir, slug);
    if (!fs.existsSync(publicEmpreendimentoDir)) {
      fs.mkdirSync(publicEmpreendimentoDir, { recursive: true });
    }

    const itemsInDir = fs.readdirSync(empreendimentoDir);
    // Find Imagens dir
    const imagensDirName = itemsInDir.find(i => i.toLowerCase().includes('imagens') && fs.statSync(path.join(empreendimentoDir, i)).isDirectory());
    
    if (imagensDirName) {
      const imgSourceDir = path.join(empreendimentoDir, imagensDirName);
      const images = fs.readdirSync(imgSourceDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
      
      for (const img of images) {
        const srcPath = path.join(imgSourceDir, img);
        const destPath = path.join(publicEmpreendimentoDir, img);
        fs.copyFileSync(srcPath, destPath);
        itemData.imagens.push(`/imoveis/${slug}/${img}`);
      }
    }
    
    // Some have an alternative imagens folder like "Imagens - George VI - Decorado"
    const outrasImagensDir = itemsInDir.filter(i => i !== imagensDirName && i.toLowerCase().includes('imagens') && fs.statSync(path.join(empreendimentoDir, i)).isDirectory());
    for (const outImgDir of outrasImagensDir) {
        const imgSourceDir = path.join(empreendimentoDir, outImgDir);
        const images = fs.readdirSync(imgSourceDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
        
        for (const img of images) {
          const srcPath = path.join(imgSourceDir, img);
          const destName = `${outImgDir}-${img}`;
          const destPath = path.join(publicEmpreendimentoDir, destName);
          fs.copyFileSync(srcPath, destPath);
          itemData.imagens.push(`/imoveis/${slug}/${destName}`);
        }
    }

    imoveis.push(itemData);
  }
  
  // Also list the root PDFs/docs for construtora (like Dallo)
  const files = fs.readdirSync(construtoraDir).filter(item => fs.statSync(path.join(construtoraDir, item)).isFile() && item.endsWith('.pdf'));
  for (const file of files) {
      if (file.toLowerCase().includes('tabela')) {
         let extractName = file.replace('Tabela', '').replace('.pdf', '').replace('-', '').replace('Fevereiro 2026', '').trim();
         if (!extractName) extractName = file;
         const slug = extractName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
         imoveis.push({
            id: slug,
            nome: extractName,
            construtora: construtora,
            imagens: [],
            descricao: 'Consulte a tabela para mais detalhes.',
            preco: 'Consulte a Tabela',
            detalhes: []
         });
      }
  }
}

const fileContent = `export interface Imovel {
  id: string;
  nome: string;
  construtora: string;
  imagens: string[];
  descricao: string;
  preco: string;
  detalhes: string[];
}

export const imoveis: Imovel[] = ${JSON.stringify(imoveis, null, 2)};
`;

fs.writeFileSync(dataFile, fileContent, 'utf-8');
console.log('Script finalizado. Dados e imagens copiados com sucesso.');
