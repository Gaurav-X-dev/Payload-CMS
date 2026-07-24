const fs = require('fs');
const path = require('path');

const layouts = ['Header', 'Footer', 'AnnouncementBar', 'MobileMenu', 'Preloader'];
const ui = ['Button', 'Card', 'Badge', 'Input'];
const blockRenderers = [
  'Hero', 'FeatureStrip', 'CardGrid', 'ContentGrid', 'Steps', 
  'Testimonials', 'Stats', 'Split', 'Gallery', 'Form', 
  'MenuShowcase', 'Team', 'FAQ', 'Locations', 'BlogPreview', 
  'Embed', 'CTA', 'Newsletter', 'RichText', 'Spacer',
  'RoomsShowcase', 'Amenities', 'Packages', 'SubBrands'
];

const createDir = (dir) => {
  const p = path.join(__dirname, 'src', 'components', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

['layout', 'ui', 'blocks'].forEach(createDir);

const componentTemplate = (name, type) => `import React from 'react'
import styles from './${name}.module.css'

export const ${name}: React.FC<any> = (props) => {
  return (
    <div className={styles.${name.toLowerCase()}}>
      {/* ${type} Component: ${name} */}
      <h2>${name}</h2>
    </div>
  )
}
`;

const cssTemplate = (name) => `.${name.toLowerCase()} {
  /* Scoped styles for ${name} */
}
`;

layouts.forEach(name => {
  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'layout', name + '.tsx'), componentTemplate(name, 'Layout'));
  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'layout', name + '.module.css'), cssTemplate(name));
});

ui.forEach(name => {
  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'ui', name + '.tsx'), componentTemplate(name, 'UI'));
  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'ui', name + '.module.css'), cssTemplate(name));
});

blockRenderers.forEach(name => {
  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'blocks', name + '.tsx'), componentTemplate(name, 'Block'));
  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'blocks', name + '.module.css'), cssTemplate(name));
});

// BlockRenderer
const blockRendererMap = blockRenderers.map(name => `  ${name.toLowerCase()}: ${name},`).join('\n');
const blockRendererImports = blockRenderers.map(name => `import { ${name} } from './blocks/${name}'`).join('\n');

const blockRendererTemplate = `import React from 'react'
${blockRendererImports}

const blockComponents = {
${blockRendererMap}
}

export const BlockRenderer: React.FC<{ blocks: any[] }> = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block, i) => {
        const Block = blockComponents[block.blockType as keyof typeof blockComponents]
        if (Block) {
          return <Block key={i} {...block} />
        }
        return <div key={i}>Unknown Block: {block.blockType}</div>
      })}
    </>
  )
}
`;
fs.writeFileSync(path.join(__dirname, 'src', 'components', 'BlockRenderer.tsx'), blockRendererTemplate);

// PageRenderer
const pageRendererTemplate = `import React from 'react'
import { Header } from './layout/Header'
import { Footer } from './layout/Footer'
import { BlockRenderer } from './BlockRenderer'

export const PageRenderer: React.FC<{ page: any, tenant: any }> = ({ page, tenant }) => {
  return (
    <div className="page-wrapper" data-tenant={tenant?.slug}>
      <Header tenant={tenant} />
      <main>
        {page?.layout && <BlockRenderer blocks={page.layout} />}
      </main>
      <Footer tenant={tenant} />
    </div>
  )
}
`;
fs.writeFileSync(path.join(__dirname, 'src', 'components', 'PageRenderer.tsx'), pageRendererTemplate);

console.log('Components generated successfully.');
