import type { Block } from 'payload'

export const RoomsShowcaseBlock: Block = {
  slug: 'roomsshowcaseBlock',
  interfaceName: 'RoomsShowcaseBlock',
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
