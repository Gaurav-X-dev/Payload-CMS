import { CMSPageHero, CMSSectionHeader, PlainCardGrid } from './CMSInnerPageShared'
import { InquiryForm } from './InquiryForm'
import type { ZuruZuruContentGridBlockData, ZuruZuruPageBlockData, ZuruZuruStatsBlockData } from '../mappers/dynamicTypes'

function ContentGridSection({ alt, block }: { alt?: boolean; block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className={alt ? 'zz-section-alt' : undefined}><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <PlainCardGrid items={block.items} />
    </div></section>
  )
}

function StatsSection({ block }: { block: ZuruZuruStatsBlockData }) {
  if (block.stats.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <CMSSectionHeader dark header={block.header} />
      <div className="zz-stats">
        {block.stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div></section>
  )
}

function InquiryFormSection() {
  return (
    <section className="zz-section-alt"><div className="zz-container zz-form-panel zz-form-narrow">
      <h2>Franchise Inquiry Form</h2>
      <InquiryForm
        fields={[
          { label: 'Full Name', name: 'name' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Phone', name: 'phone', type: 'tel' },
          { label: 'Preferred City', name: 'city' },
          { label: 'Investment Capacity', name: 'investment', options: ['₹75L – ₹1Cr', '₹1.5Cr – ₹2Cr', '₹3Cr – ₹4Cr'], type: 'select' },
          { label: 'Tell Us About Yourself', name: 'message', type: 'textarea' },
        ]}
        formType="franchise"
        submitLabel="Submit Inquiry"
        subject="Partnership"
      />
    </div></section>
  )
}

export function CMSFranchisePage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  // Investment Overview and What We Provide are both plain (non-dark) contentgridBlock instances
  // with no other distinguishing field, so — unlike Careers' light/dark pair — they're identified
  // by their fixed seed order (investments first, support second) rather than any stored flag.
  const contentGrids = blocks.filter((block) => block.type === 'contentGrid')
  const investments = contentGrids[0]
  const support = contentGrids[1]
  const stats = blocks.find((block) => block.type === 'stats')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {investments?.type === 'contentGrid' && <ContentGridSection alt block={investments.data} />}
      {support?.type === 'contentGrid' && <ContentGridSection block={support.data} />}
      {stats?.type === 'stats' && <StatsSection block={stats.data} />}
      <InquiryFormSection />
    </>
  )
}
