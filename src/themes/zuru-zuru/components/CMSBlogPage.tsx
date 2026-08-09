import Image from 'next/image'
import { CMSPageHero } from './CMSInnerPageShared'
import type { ZuruZuruBlogPostItemData, ZuruZuruBlogPreviewBlockData, ZuruZuruPageBlockData } from '../mappers/dynamicTypes'

/**
 * `BlogPosts.readingTimeMinutes` is forcibly recalculated to a hardcoded `2` by a pre-existing,
 * out-of-scope `beforeChange` hook whenever `content` is present — every post here will show
 * "2 Min Read" regardless of actual length. Disclosed in the Milestone Z7 report; not a Z7 defect.
 */
function formatPostMeta(post: ZuruZuruBlogPostItemData): string {
  const category = post.categories[0] ?? ''
  const date = post.publishedDate ? new Date(post.publishedDate) : null
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata', year: 'numeric' }).format(date)
    : ''
  return [category, dateLabel, '2 Min Read'].filter(Boolean).join(' · ')
}

function FeaturedPostSection({ post }: { post: ZuruZuruBlogPostItemData }) {
  return (
    <section><div className="zz-container zz-featured-post">
      <div className="zz-card-image">
        {post.image && <Image alt={post.title} fill sizes="(max-width: 992px) 100vw, 60vw" src={post.image.src} />}
      </div>
      {post.categories[0] && <span>{post.categories[0]}</span>}
      <h2>{post.title}</h2>
      <p>{formatPostMeta(post)}{post.author ? ` · ${post.author}` : ''}</p>
      <p>{post.excerpt}</p>
    </div></section>
  )
}

function PostGrid({ posts }: { posts: ZuruZuruBlogPostItemData[] }) {
  if (posts.length === 0) return null
  return (
    <section className="zz-section-alt"><div className="zz-container">
      <div className="zz-content-grid zz-grid-3">
        {posts.map((post) => (
          <article className="zz-content-card" key={post.id}>
            {post.image && (
              <div className="zz-card-image">
                <Image alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" src={post.image.src} />
              </div>
            )}
            <div className="zz-card-copy">
              <span className="zz-card-meta">{formatPostMeta(post)}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function BlogSections({ block }: { block: ZuruZuruBlogPreviewBlockData }) {
  const featured = block.posts.find((post) => post.isPinned)
  const grid = block.posts.filter((post) => post !== featured)
  return (
    <>
      {featured && <FeaturedPostSection post={featured} />}
      <PostGrid posts={grid} />
    </>
  )
}

export function CMSBlogPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const preview = blocks.find((block) => block.type === 'blogPreview')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {preview?.type === 'blogPreview' && <BlogSections block={preview.data} />}
    </>
  )
}
