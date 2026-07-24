const fs = require('fs');
const path = require('path');

const blocks = [
  'Hero', 'FeatureStrip', 'CardGrid', 'ContentGrid', 'Steps', 
  'Testimonials', 'Stats', 'Split', 'Gallery', 'Form', 
  'MenuShowcase', 'Team', 'FAQ', 'Locations', 'BlogPreview', 
  'Embed', 'CTA', 'Newsletter', 'RichText', 'Spacer',
  'RoomsShowcase', 'Amenities', 'Packages', 'SubBrands'
];

const template = (name) => `import type { Block } from 'payload'

export const ${name}Block: Block = {
  slug: '${name.toLowerCase()}Block',
  interfaceName: '${name}Block',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'subtitle',
      type: 'text',
    },
  ],
}
`;

blocks.forEach(name => {
  fs.writeFileSync(path.join(__dirname, 'src', 'blocks', name + '.ts'), template(name));
});

// Create index.ts
let indexContent = blocks.map(name => `export { ${name}Block } from './${name}'`).join('\n') + '\n\n';
indexContent += `export const AllBlocks = [\n${blocks.map(name => `  ${name}Block,`).join('\n')}\n]\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'blocks', 'index.ts'), indexContent);

console.log('Blocks created successfully.');
