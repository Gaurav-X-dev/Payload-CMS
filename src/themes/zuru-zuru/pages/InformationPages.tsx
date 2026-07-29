import Link from 'next/link'
import { Accordion, FrontendForm } from '../components/Interactive'
import { CardGrid, FormField, PageHero, SectionHeader } from '../components/Shared'

export function BlogPage() {
  const posts = [
    ['Crafting the Perfect Shoyu Tare at Home','Recipes · Sep 28, 2026 · 5 Min Read'],["A Beginner's Guide to Japanese Sake Pairing",'Culture · Sep 15, 2026 · 6 Min Read'],['The Journey of Fresh Tuna: From Sea to Plate','Ingredients · Sep 02, 2026 · 7 Min Read'],['Why Ceremonial Grade Matcha Matters','Desserts · Aug 20, 2026 · 4 Min Read'],['The Evolution of the Izakaya in Modern Times','Culture · Aug 11, 2026 · 10 Min Read'],['Grilling Perfection: The Art of Yakitori','Recipes · Jul 29, 2026 · 5 Min Read'],['Hand-folding 1,000 Gyoza Daily','Behind the Scenes · Jul 15, 2026 · 6 Min Read'],['Alkaline Noodles and the Perfect Slurp','Ingredients · Jun 30, 2026 · 4 Min Read'],['Omotenashi: The Japanese Spirit of Hospitality','Culture · Jun 18, 2026 · 7 Min Read'],
  ].map(([title,meta],index)=>({title,meta,image:['hero_ramen.png','hero_sushi.png','gyoza_tempura.png'][index%3],description:'Read More'}))
  return <><PageHero background="hero_ramen.png" title="Stories & Recipes" text="Dive deep into the culinary philosophy, secret recipes, and the vibrant Izakaya culture of Japan." /><section><div className="zz-container zz-featured-post"><div className="zz-card-image" /><span>Behind the Scenes</span><h2>Mastering the 48-Hour Tonkotsu Broth</h2><p>Oct 12, 2026 · 8 Min Read · Chef Hiroshi</p><p>The secret to our signature ramen lies in the slow, meticulous simmering of pork bones over two full days. Discover the passion, precision, and traditional techniques that go into every bowl at Zuru Zuru.</p><Link className="zz-btn zz-btn-link" href="#">Read Full Story</Link></div></section><section className="zz-section-alt"><div className="zz-container"><CardGrid cards={posts} /></div></section></>
}

export function CareersPage() {
  const reasons = [{title:'Respect & Culture',description:"Rooted in the Japanese concept of Wa (harmony), we foster a supportive, respectful workplace where everyone's voice is heard."},{title:'Continuous Training',description:'From knife skills to sake sommelier certification, we invest heavily in your professional development and culinary education.'},{title:'Growth Opportunities',description:'We believe in promoting from within. Many of our head chefs and managers started their journey with us in entry-level roles.'},{title:'Work-Life Balance',description:'We value your well-being with flexible scheduling, consecutive days off, and respect for your personal time outside the kitchen.'}]
  const jobs = [{title:'Sushi Chef (Itamae)',meta:'Culinary Team · Delhi, India · Full-time',description:'Seeking an experienced Sushi Chef with a passion for precision and traditional techniques.'},{title:'Restaurant Manager',meta:'Front of House · Delhi, India · Full-time',description:'Looking for a dynamic leader to oversee daily operations and ensure impeccable guest experiences.'},{title:'Sake Sommelier',meta:'Beverage · Delhi, India · Part-time',description:'Passionate about sake? Help our guests navigate our extensive curated sake menu.'}]
  return <><PageHero background="chef.png" title="Join Our Team" text="Build a rewarding career serving authentic Japanese cuisine in an environment that values passion, respect, and continuous growth." /><section><div className="zz-container"><SectionHeader title="Why Work With Us" text="Discover the Zuru Zuru difference" /><CardGrid cards={reasons} columns={4} /></div></section><section className="zz-section-dark"><div className="zz-container"><SectionHeader dark title="Perks & Benefits" text="We take care of our team members" /><div className="zz-benefits">{['Comprehensive Health Insurance','Free Shift Meals','Competitive Salary + Tips','Paid Time Off','50% Family Dining Discount','Late Night Commute Allowance','Performance Bonuses','Uniforms & Footwear Allowance'].map(x=><span key={x}>{x}</span>)}</div></div></section><section><div className="zz-container"><SectionHeader title="Current Openings" text="Find your place in our growing family" /><CardGrid cards={jobs} /></div></section><section className="zz-section-alt"><div className="zz-container zz-form-panel zz-form-narrow"><h2>Apply Now</h2><p>Don&apos;t see a role that fits? We&apos;re always looking for talent. Submit your resume below.</p><FrontendForm className="zz-form-grid"><FormField label="First Name" name="first" /><FormField label="Last Name" name="last" /><FormField label="Email" name="email" type="email" /><FormField label="Phone Number" name="phone" type="tel" /><FormField label="Position of Interest" name="position" options={['Sushi Chef','Restaurant Manager','Sake Sommelier','Server','Kitchen Staff','Other']} placeholder="Select a position..." type="select" /><FormField label="Cover Letter (Optional)" name="cover" type="textarea" /><button className="zz-btn zz-btn-primary" type="submit">Submit Application</button></FrontendForm></div></section></>
}

export function LocationsPage() {
  const locations = [
    {title:'Shahpur Jat, New Delhi',meta:'Flagship Store',image:'interior.png',description:'Zuru Zuru, Delhi, India 110049 · +91 11 4052 7373 · Mon - Thu: 12:00 PM - 10:30 PM · Fri - Sun: 12:00 PM - 11:30 PM'},
    {title:'Connaught Place, New Delhi',meta:'Open Now',image:'hero_sushi.png',description:'Zuru Zuru, Delhi, India 110049 · +91 11 4052 7474 · Mon - Sun: 11:00 AM - 11:30 PM'},
    {title:'Cyber Hub, Gurugram',meta:'Open Now',image:'hero_ramen.png',description:'Zuru Zuru, Delhi, India 110049 · +91 124 4052 7575 · Mon - Sun: 12:00 PM - 12:00 AM'},
    {title:'Indiranagar, Bengaluru',meta:'Coming Soon - Dec 2026',image:'gyoza_tempura.png',description:'Zuru Zuru, Delhi, India 110049 · Not yet active · Opening Soon'},
  ]
  return <><PageHero background="interior.png" title="Our Locations" text="Find a Zuru Zuru Izakaya near you and experience the authentic taste of Japan." /><section><div className="zz-container"><CardGrid cards={locations} columns={2} /></div></section><section className="zz-section-dark"><div className="zz-container"><SectionHeader dark title="Guest Amenities" text="Everything you need for a comfortable dining experience" /><div className="zz-benefits">{['Free Wi-Fi','Valet Parking','Accessible','Full Bar','Private Dining','Vegan Options'].map(x=><span key={x}>{x}</span>)}</div></div></section><section><div className="zz-container zz-map-placeholder"><h3>Explore Our Map</h3><p>Interactive maps and virtual tours available on our app.</p></div></section></>
}

export function FranchisePage() {
  const investments = [
    {title:'Express',meta:'₹75L – ₹1Cr',description:'600–900 sq. ft. · Food court / high street · 25–40 seats · Estimated opening: 5–7 months'},
    {title:'Classic',meta:'₹1.5Cr – ₹2Cr',description:'1,500–2,000 sq. ft. · Premium high street / mall · 60–90 seats · Estimated opening: 7–9 months'},
    {title:'Premium',meta:'₹3Cr – ₹4Cr',description:'3,000–4,500 sq. ft. · Flagship destination · 120–180 seats · Estimated opening: 9–12 months'},
  ]
  const support = ['Location & Setup','Culinary Training','Operations Support','Marketing & Brand','Supply Chain','Business Review'].map(title=>({title,description:'Comprehensive guidance from our experienced franchise and restaurant operations team.'}))
  return <><PageHero background="interior.png" title="Franchise Opportunity" text="Partner with Zuru Zuru and bring an award-winning Japanese Izakaya experience to your city." /><section className="zz-section-alt"><div className="zz-container"><SectionHeader title="Investment Overview" /><CardGrid cards={investments} /></div></section><section><div className="zz-container"><SectionHeader title="What We Provide" /><CardGrid cards={support} /></div></section><section className="zz-section-dark"><div className="zz-container"><SectionHeader dark title="Proven Success Metrics" /><div className="zz-stats"><div><strong>28%</strong><span>Average EBITDA</span></div><div><strong>18 Mo</strong><span>Average Break-even</span></div><div><strong>4.8★</strong><span>Average Guest Rating</span></div><div><strong>65%</strong><span>Repeat Customers</span></div></div></div></section><section className="zz-section-alt"><div className="zz-container zz-form-panel zz-form-narrow"><h2>Franchise Inquiry Form</h2><FrontendForm className="zz-form-grid"><FormField label="Full Name" name="name" /><FormField label="Email" name="email" type="email" /><FormField label="Phone" name="phone" type="tel" /><FormField label="Preferred City" name="city" /><FormField label="Investment Capacity" name="investment" options={['₹75L – ₹1Cr','₹1.5Cr – ₹2Cr','₹3Cr – ₹4Cr']} type="select" /><FormField label="Tell Us About Yourself" name="message" type="textarea" /><button className="zz-btn zz-btn-primary" type="submit">Submit Inquiry</button></FrontendForm></div></section></>
}

const faqItems: Array<[string,string]> = [
  ['Do I need a reservation?','Reservations are strongly recommended, especially for evenings and weekends. Walk-ins are always welcome and seated subject to availability.'],
  ['How far in advance can I reserve?','Reservations open 60 days in advance through our website or by phone.'],
  ['What is your cancellation policy?','We request at least 24 hours notice for cancellations or changes.'],
  ['Do you accommodate large groups?','Yes. For parties of eight or more, please contact our events team for set-menu and private dining options.'],
  ['Do you offer vegetarian or vegan dishes?','Yes, our menu includes vegetarian and vegan dishes. Please inform your server of dietary requirements.'],
  ['Can you accommodate food allergies?','We make every reasonable effort, but our kitchen handles common allergens and cannot guarantee an allergen-free environment.'],
  ['Do you offer delivery and takeaway?','Yes, selected dishes are available for takeaway and delivery within our service areas.'],
  ['What payment methods do you accept?','We accept major credit and debit cards, UPI, and cash.'],
]

export function FAQPage() { return <><PageHero background="hero_ramen.png" title="Frequently Asked Questions" text="Everything you need to know before your Zuru Zuru experience." /><section className="zz-section-alt"><div className="zz-container zz-form-narrow"><SectionHeader title="Reservations" /><Accordion items={faqItems} /></div></section></> }

const privacySections = [
  ['1. Introduction','Welcome to Zuru Zuru Izakaya. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website, dine at our restaurant, or use our services, and tell you about your privacy rights and how the law protects you.'],
  ['2. The Data We Collect About You','Personal data means any information about an individual from which that person can be identified. We may collect Identity Data, Contact Data, Financial Data, Transaction Data, Profile Data, and Usage Data.'],
  ['3. How We Collect Your Data','We collect data through direct interactions, including reservations, orders, newsletter subscriptions, promotions, surveys, and feedback, and through automated technologies such as cookies and server logs.'],
  ['4. How We Use Your Personal Data','We will only use your personal data when the law allows us to, including to perform a contract, pursue legitimate interests, or comply with a legal obligation.'],
  ['5. Data Security','We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered, or disclosed without authorisation.'],
  ['6. Data Retention','We retain your personal data only for as long as reasonably necessary to fulfil the purposes for which it was collected.'],
  ['7. Your Legal Rights','You may request access, correction, erasure, restriction, transfer, object to processing, or withdraw consent. Contact privacy@zuruzuru.in.'],
  ['8. Contact Us','Email: privacy@zuruzuru.in · Postal address: 23 Shahpur Jat, Siri Fort, New Delhi 110049, India · Telephone: +91 11 4052 7373'],
]
const termsSections = [
  ['1. Agreement to Terms','These Terms and Conditions constitute a legally binding agreement between you and Zuru Zuru Izakaya concerning your access to and use of www.zuruzuru.in and related services. By accessing the Site, you agree to be bound by these Terms and Conditions.'],
  ['2. Reservations and Cancellation Policy',"Reservations may be made online, by phone, or in person. We hold reserved tables for 15 minutes. We request a minimum of 4 hours' notice for cancellations, and 24 hours for large groups or private events."],
  ['3. Dietary Requirements and Allergies','We make every effort to accommodate dietary requirements and food allergies, but cannot guarantee a completely allergen-free environment due to cross-contamination risk.'],
  ['4. Online Ordering and Delivery','Orders are subject to acceptance. Estimated delivery times are guidelines. Refunds are processed at management discretion for incorrect or unsatisfactory orders.'],
  ['5. Intellectual Property Rights','The Site, its code, functionality, designs, text, photographs, graphics, trademarks, and service marks are owned or controlled by us or licensed to us and protected by law.'],
  ['6. User Representations','You represent that information you provide is accurate, that you have legal capacity, and that you will not use the Site for an illegal or unauthorised purpose.'],
  ['7. Modifications and Interruptions','We reserve the right to change, modify, or remove Site contents and will not be liable for modification, price change, suspension, or discontinuance.'],
  ['8. Governing Law','These Terms are governed by the laws of India. The courts of New Delhi have exclusive jurisdiction.'],
  ['9. Contact Us','Zuru Zuru Izakaya · 23 Shahpur Jat, Siri Fort, New Delhi 110049, India · +91 11 4052 7373 · legal@zuruzuru.in'],
]

function LegalPage({ title, subtitle, sections }: { sections: string[][]; subtitle: string; title: string }) {
  return <><PageHero background="interior.png" title={title} text={subtitle} /><section className="zz-legal-container"><article className="zz-legal-content"><em>Last Updated: July 16, 2026</em>{sections.map(([heading,text])=><section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}</article></section></>
}
export function PrivacyPage() { return <LegalPage sections={privacySections} subtitle="How we collect, use, and protect your data." title="Privacy Policy" /> }
export function TermsPage() { return <LegalPage sections={termsSections} subtitle="Please read these terms carefully before using our services." title="Terms & Conditions" /> }
