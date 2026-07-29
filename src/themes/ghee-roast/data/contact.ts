import type { ContentPageData, FormFieldData } from '../types'

export const contactData = {
  metadata: {
    title: 'Contact Us | Very Good Ghee Roast',
    description: 'Contact our Delhi and Gurugram kitchens for orders, catering enquiries or feedback.',
  },
  hero: {
    eyebrow: 'Contact Us',
    title: 'Come Find Us',
    subtitle: 'We’d love to hear from you. Reach out for orders, catering enquiries, feedback or just to say hello.',
  },
  fields: [
    { label: 'Full Name', name: 'name', placeholder: 'Enter your name', required: true, type: 'text' },
    { label: 'Email Address', name: 'email', placeholder: 'Enter your email', required: true, type: 'email' },
    { label: 'Phone Number', name: 'phone', placeholder: 'Enter your phone', required: true, type: 'tel' },
    {
      label: 'Subject',
      name: 'subject',
      required: true,
      type: 'select',
      options: ['General Enquiry', 'Order Issue', 'Catering Request', 'Feedback', 'Partnership'],
    },
    { label: 'Message', name: 'message', placeholder: 'How can we help you?', required: true, type: 'textarea' },
  ] satisfies FormFieldData[],
  locations: [
    { icon: 'map', title: 'Delhi Kitchen', lines: ['Delivery Kitchen, South/Central Delhi', 'India'] },
    { icon: 'map', title: 'Gurugram Kitchen', lines: ['Delivery Kitchen, Gurugram', 'Haryana, India'] },
    { icon: 'phone', title: 'Phone Support', lines: ['+91 99102 13465', 'Call for orders & enquiries'] },
    { icon: 'clock', title: 'Operating Hours', lines: ['Mon – Sun: 1 PM – 10 PM', 'Tuesdays: Closed'] },
  ],
} satisfies ContentPageData & Record<string, unknown>
