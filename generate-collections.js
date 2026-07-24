const fs = require('fs');
const path = require('path');

const collections = [
  'MenuCategories', 'MenuItems', 'Testimonials', 'TeamMembers', 'Events', 
  'Reservations', 'BlogPosts', 'Locations', 'FAQs', 'FormSubmissions', 
  'SiteSettings', 'Navigation', 'FooterConfig', 'Redirects', 'Rooms', 
  'Amenities', 'Packages'
];

const template = (name) => `import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'

export const ${name}: CollectionConfig = {
  slug: '${name.toLowerCase()}',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: tenantIsolation,
    update: tenantIsolation,
    delete: tenantIsolation,
  },
  fields: [
    tenantField(),
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}
`;

const globalTemplate = (name) => `import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'

export const ${name}: CollectionConfig = {
  slug: '${name.toLowerCase()}',
  admin: {
    useAsTitle: 'tenantId',
  },
  access: {
    read: () => true,
    create: tenantIsolation,
    update: tenantIsolation,
    delete: tenantIsolation,
  },
  fields: [
    tenantField(),
  ],
}
`;

collections.forEach(name => {
  const isGlobalLike = ['SiteSettings', 'Navigation', 'FooterConfig'].includes(name);
  const content = isGlobalLike ? globalTemplate(name) : template(name);
  fs.writeFileSync(path.join(__dirname, 'src', 'collections', name + '.ts'), content);
});

console.log('Collections created successfully.');
