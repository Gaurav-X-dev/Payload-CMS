import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { CuriousLadooBlogPostDetailData } from '../mappers/dynamicTypes'
import { ScrollReveal } from './ScrollReveal'
import { SmartLink } from './CMSHomePage'
import styles from './Theme.module.css'

export function BlogPostPage({ post }: { post: CuriousLadooBlogPostDetailData }) {
  const metaParts = [post.date, post.authorName ? `By ${post.authorName}` : '', post.readMinutes ? `${post.readMinutes} min read` : '']
    .filter(Boolean)

  return (
    <>
      <section className={styles.innerHero}>
        <div className={styles.innerHeroContent}>
          {post.categories[0] && <span className={styles.innerHeroEyebrow}>{post.categories[0]}</span>}
          <h1 className={styles.innerHeroTitle}>{post.title}</h1>
          {post.excerpt && <p className={styles.innerHeroBody}>{post.excerpt}</p>}
        </div>
      </section>

      <section className={styles.innerSection}>
        <div style={{ margin: '0 auto', maxWidth: '760px' }}>
          {metaParts.length > 0 && (
            <ScrollReveal>
              <div className={styles.articleMeta}>
                {metaParts.map((part) => <span key={part}>{part}</span>)}
              </div>
            </ScrollReveal>
          )}

          {post.coverImage && (
            <ScrollReveal delay={1}>
              <div className={styles.articleCoverImage}>
                <Image alt={post.coverImage.alt} fill loading="lazy" src={post.coverImage.src} style={{ objectFit: 'cover' }} />
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={2}>
            <div className={styles.articleBody}>
              <RichText data={post.content as never} />
            </div>
          </ScrollReveal>

          {post.tags.length > 0 && (
            <ScrollReveal delay={3}>
              <div className={styles.articleTags}>
                {post.tags.map((tag) => <span className={styles.articleTag} key={tag}>{tag}</span>)}
              </div>
            </ScrollReveal>
          )}
        </div>

        {post.relatedPosts.length > 0 && (
          <div style={{ marginTop: 'clamp(60px, 8vw, 100px)' }}>
            <ScrollReveal>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>Related Articles</h2>
            </ScrollReveal>
            <div className={styles.blogMainGrid}>
              {post.relatedPosts.map((related, i) => (
                <ScrollReveal delay={((i % 3) as 0 | 1 | 2)} key={related.id}>
                  <SmartLink className={styles.journalCard} href={`/blog/${related.slug}`}>
                    <div className={styles.journalCardImage}>
                      {related.image && (
                        <Image alt={related.image.alt} fill loading="lazy" src={related.image.src} style={{ objectFit: 'cover' }} />
                      )}
                    </div>
                    <div className={styles.journalCardBody}>
                      {related.tag && <div className={styles.journalCardTag}>{related.tag}</div>}
                      <h4 className={styles.journalCardTitle}>{related.title}</h4>
                      <p className={styles.journalCardExcerpt}>{related.excerpt}</p>
                      <div className={styles.journalCardMeta}>{related.date}</div>
                    </div>
                  </SmartLink>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
