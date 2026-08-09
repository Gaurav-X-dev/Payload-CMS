import { BenefitsPills, CMSPageHero, CMSSectionHeader, PlainCardGrid } from './CMSInnerPageShared'
import { InquiryForm } from './InquiryForm'
import type {
  ZuruZuruCareersBlockData,
  ZuruZuruContentGridBlockData,
  ZuruZuruPageBlockData,
} from '../mappers/dynamicTypes'

function ReasonsSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <PlainCardGrid items={block.items} />
    </div></section>
  )
}

function BenefitsSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <CMSSectionHeader dark header={block.header} />
      <BenefitsPills labels={block.items.map((item) => item.title)} />
    </div></section>
  )
}

/** careersBlock has real, separate department/type/location fields (unlike generic contentgridBlock), so the original's "Culinary Team · Delhi, India · Full-time" meta line is reconstructed properly instead of folded into the title. */
function OpeningsSection({ block }: { block: ZuruZuruCareersBlockData }) {
  if (block.positions.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <div className="zz-content-grid zz-grid-3">
        {block.positions.map((position) => (
          <article className="zz-content-card" key={position.title}>
            <div className="zz-card-copy">
              <span className="zz-card-meta">{[position.department, position.location, position.type].filter(Boolean).join(' · ')}</span>
              <h3>{position.title}</h3>
              <p>{position.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function ApplyForm() {
  return (
    <section className="zz-section-alt"><div className="zz-container zz-form-panel zz-form-narrow">
      <h2>Apply Now</h2>
      <p>Don&apos;t see a role that fits? We&apos;re always looking for talent. Submit your resume below.</p>
      <InquiryForm
        fields={[
          { label: 'First Name', name: 'first' },
          { label: 'Last Name', name: 'last' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Phone Number', name: 'phone', type: 'tel' },
          { label: 'Position of Interest', name: 'position', options: ['Sushi Chef', 'Restaurant Manager', 'Sake Sommelier', 'Server', 'Kitchen Staff', 'Other'], placeholder: 'Select a position...', type: 'select' },
          { label: 'Cover Letter (Optional)', name: 'cover', type: 'textarea' },
        ]}
        formType="careers"
        submitLabel="Submit Application"
        subject="Careers"
      />
    </div></section>
  )
}

export function CMSCareersPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const contentGrids = blocks.filter((block) => block.type === 'contentGrid')
  const reasons = contentGrids.find((block) => block.type === 'contentGrid' && !block.data.dark)
  const benefits = contentGrids.find((block) => block.type === 'contentGrid' && block.data.dark)
  const careers = blocks.find((block) => block.type === 'careers')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {reasons?.type === 'contentGrid' && <ReasonsSection block={reasons.data} />}
      {benefits?.type === 'contentGrid' && <BenefitsSection block={benefits.data} />}
      {careers?.type === 'careers' && <OpeningsSection block={careers.data} />}
      <ApplyForm />
    </>
  )
}
