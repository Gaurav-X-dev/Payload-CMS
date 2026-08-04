import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyGheeRoastHero,
  mapGheeRoastHero,
} from "../src/themes/ghee-roast/mappers/cmsContent.ts";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const TENANT_ID = 3167;

const mediaDoc = (overrides: Record<string, unknown> = {}) => ({
  id: 42,
  tenantId: TENANT_ID,
  alt: "media alt text",
  url: "/media/hero.jpg",
  ...overrides,
});

const heroBlock = (overrides: Record<string, unknown> = {}) => ({
  blockType: "heroBlock",
  enabled: true,
  heading: "Real Ingredients.\nRich Flavours.",
  highlightedHeading: "Pure Ghee.",
  description: "Slow roasted in pure ghee.",
  stampText: "Slow\nRoasted\nIn Ghee\nWith Love",
  orderPlatformsLabel: "Also available on",
  primaryCTALabel: "Explore Menu",
  primaryCTAURL: "/menu",
  secondaryCTALabel: "Order Now",
  secondaryCTAURL: "/delivery",
  ...overrides,
});

const publishedHomePage = (
  layout: Record<string, unknown>[] = [heroBlock()],
) => ({
  tenantId: TENANT_ID,
  isHomePage: true,
  _status: "published" as const,
  layout,
});

// ---------------------------------------------------------------------------
// 1. Heading and highlighted heading
// ---------------------------------------------------------------------------

test("Hero: heading and highlighted heading are mapped correctly", () => {
  const result = mapGheeRoastHero(publishedHomePage(), TENANT_ID);
  assert.equal(result.heading, "Real Ingredients.\nRich Flavours.");
  assert.equal(result.highlightedHeading, "Pure Ghee.");
});

// ---------------------------------------------------------------------------
// 2. Description
// ---------------------------------------------------------------------------

test("Hero: description is mapped correctly", () => {
  const result = mapGheeRoastHero(publishedHomePage(), TENANT_ID);
  assert.equal(result.description, "Slow roasted in pure ghee.");
});

// ---------------------------------------------------------------------------
// 3. Stamp text
// ---------------------------------------------------------------------------

test("Hero: stampText is mapped correctly", () => {
  const result = mapGheeRoastHero(publishedHomePage(), TENANT_ID);
  assert.equal(result.stampText, "Slow\nRoasted\nIn Ghee\nWith Love");
});

test("Hero: missing stampText produces undefined", () => {
  const page = publishedHomePage([heroBlock({ stampText: null })]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.stampText, undefined);
});

// ---------------------------------------------------------------------------
// 4. Image relationship object resolution
// ---------------------------------------------------------------------------

test("Hero: foregroundImage relationship object resolves src and alt", () => {
  const page = publishedHomePage([heroBlock({ foregroundImage: mediaDoc() })]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image?.src, "/media/hero.jpg");
  assert.equal(result.image?.alt, "media alt text");
});

// ---------------------------------------------------------------------------
// 5. Image bare ID (depth 0) � graceful fallback
// ---------------------------------------------------------------------------

test("Hero: bare relationship ID for foregroundImage returns undefined image safely", () => {
  const page = publishedHomePage([heroBlock({ foregroundImage: 42 })]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image, undefined);
});

// ---------------------------------------------------------------------------
// 6. Missing image safety
// ---------------------------------------------------------------------------

test("Hero: missing all images produces stable Hero with other fields intact", () => {
  const page = publishedHomePage([
    heroBlock({
      foregroundImage: null,
      desktopBackgroundImage: null,
      mobileBackgroundImage: null,
    }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image, undefined);
  assert.equal(result.mobileImage, undefined);
  assert.equal(result.heading, "Real Ingredients.\nRich Flavours.");
  assert.equal(result.enabled, true);
});

// ---------------------------------------------------------------------------
// 7. Desktop / mobile / foreground priority
// ---------------------------------------------------------------------------

test("Hero: foregroundImage takes priority over desktopBackgroundImage", () => {
  const fg = mediaDoc({ id: 1, url: "/media/fg.jpg", alt: "fg" });
  const bg = mediaDoc({ id: 2, url: "/media/bg.jpg", alt: "bg" });
  const page = publishedHomePage([
    heroBlock({ foregroundImage: fg, desktopBackgroundImage: bg }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image?.src, "/media/fg.jpg");
  assert.equal(result.backgroundImage?.src, "/media/bg.jpg");
});

test("Hero: separate desktop and mobile backgrounds stay distinct from the foreground dish", () => {
  const fg = mediaDoc({ id: 1, url: "/media/fg.jpg", alt: "dish" });
  const bg = mediaDoc({ id: 2, url: "/media/bg.jpg", alt: "desktop background" });
  const mobile = mediaDoc({ id: 3, url: "/media/mobile.jpg", alt: "mobile background" });
  const result = mapGheeRoastHero(publishedHomePage([
    heroBlock({
      desktopBackgroundImage: bg,
      foregroundImage: fg,
      mobileBackgroundImage: mobile,
      overlayOpacity: 0.4,
    }),
  ]), TENANT_ID);

  assert.equal(result.image?.src, "/media/fg.jpg");
  assert.equal(result.backgroundImage?.src, "/media/bg.jpg");
  assert.equal(result.mobileBackgroundImage?.src, "/media/mobile.jpg");
  assert.equal(result.mobileImage, undefined);
  assert.equal(result.overlayOpacity, 40);
});

test("Hero: desktopBackgroundImage is fallback when foregroundImage absent", () => {
  const bg = mediaDoc({ id: 2, url: "/media/bg.jpg", alt: "bg" });
  const page = publishedHomePage([
    heroBlock({ foregroundImage: null, desktopBackgroundImage: bg }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image?.src, "/media/bg.jpg");
});

test("Hero: mobileBackgroundImage populates hero.mobileImage", () => {
  const fg = mediaDoc({ id: 1, url: "/media/fg.jpg", alt: "fg" });
  const mb = mediaDoc({ id: 3, url: "/media/mobile.jpg", alt: "mobile" });
  const page = publishedHomePage([
    heroBlock({ foregroundImage: fg, mobileBackgroundImage: mb }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.mobileImage?.src, "/media/mobile.jpg");
});

test("Hero: mobileImage is undefined when mobileBackgroundImage absent", () => {
  const page = publishedHomePage([heroBlock({ mobileBackgroundImage: null })]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.mobileImage, undefined);
});

// ---------------------------------------------------------------------------
// 8. Image alt fallback order
// ---------------------------------------------------------------------------

test("Hero: imageAlt field overrides media.alt", () => {
  const media = mediaDoc({ alt: "media alt" });
  const page = publishedHomePage([
    heroBlock({ foregroundImage: media, imageAlt: "custom alt" }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image?.alt, "custom alt");
});

test("Hero: media.alt used when imageAlt is not set", () => {
  const media = mediaDoc({ alt: "media alt" });
  const page = publishedHomePage([
    heroBlock({ foregroundImage: media, imageAlt: null }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image?.alt, "media alt");
});

// ---------------------------------------------------------------------------
// 9. Primary CTA � valid pair
// ---------------------------------------------------------------------------

test("Hero: primaryCTA is set when both label and URL are valid", () => {
  const result = mapGheeRoastHero(publishedHomePage(), TENANT_ID);
  assert.deepEqual(result.primaryCTA, { href: "/menu", label: "Explore Menu" });
});

// ---------------------------------------------------------------------------
// 10. Secondary CTA � valid pair
// ---------------------------------------------------------------------------

test("Hero: secondaryCTA is set when both label and URL are valid", () => {
  const result = mapGheeRoastHero(publishedHomePage(), TENANT_ID);
  assert.deepEqual(result.secondaryCTA, {
    href: "/delivery",
    label: "Order Now",
  });
});

// ---------------------------------------------------------------------------
// 11. Partial CTA hidden
// ---------------------------------------------------------------------------

test("Hero: primaryCTA hidden when only label present", () => {
  const page = publishedHomePage([
    heroBlock({ primaryCTALabel: "Menu", primaryCTAURL: null }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.primaryCTA, undefined);
});

test("Hero: primaryCTA hidden when only URL present", () => {
  const page = publishedHomePage([
    heroBlock({ primaryCTALabel: null, primaryCTAURL: "/menu" }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.primaryCTA, undefined);
});

test("Hero: secondaryCTA hidden when only label present", () => {
  const page = publishedHomePage([
    heroBlock({ secondaryCTALabel: "Order", secondaryCTAURL: null }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.secondaryCTA, undefined);
});

test("Hero: secondaryCTA hidden when only URL present", () => {
  const page = publishedHomePage([
    heroBlock({ secondaryCTALabel: null, secondaryCTAURL: "/delivery" }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.secondaryCTA, undefined);
});

// ---------------------------------------------------------------------------
// 12. Internal / external link handling
// ---------------------------------------------------------------------------

test("Hero: internal CTA path is preserved", () => {
  const page = publishedHomePage([
    heroBlock({ primaryCTALabel: "Menu", primaryCTAURL: "/menu" }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.primaryCTA?.href, "/menu");
});

test("Hero: valid external https CTA URL is preserved", () => {
  const page = publishedHomePage([
    heroBlock({
      primaryCTALabel: "Order",
      primaryCTAURL: "https://swiggy.com/order",
    }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.primaryCTA?.href, "https://swiggy.com/order");
});

test("Hero: javascript: CTA URL is rejected � CTA becomes undefined", () => {
  const page = publishedHomePage([
    heroBlock({ primaryCTALabel: "Bad", primaryCTAURL: "javascript:alert(1)" }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.primaryCTA, undefined);
});

// ---------------------------------------------------------------------------
// 13. Platform label (orderPlatformsLabel)
// ---------------------------------------------------------------------------

test("Hero: orderPlatformsLabel is mapped from CMS", () => {
  const page = publishedHomePage([
    heroBlock({ orderPlatformsLabel: "Order via" }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.orderPlatformsLabel, "Order via");
});

test("Hero: orderPlatformsLabel is undefined when blank", () => {
  const page = publishedHomePage([heroBlock({ orderPlatformsLabel: "" })]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.orderPlatformsLabel, undefined);
});

// ---------------------------------------------------------------------------
// 14. Disabled Hero
// ---------------------------------------------------------------------------

test("Hero: enabled:false from CMS maps to enabled:false", () => {
  const page = publishedHomePage([heroBlock({ enabled: false })]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.enabled, false);
});

// ---------------------------------------------------------------------------
// 15. Fallback when no CMS page / layout
// ---------------------------------------------------------------------------

test("Hero: null page returns empty hero (fallbacksEnabled:false)", () => {
  const result = mapGheeRoastHero(null, TENANT_ID, { fallbacksEnabled: false });
  assert.equal(result.enabled, false);
  assert.equal(result.heading, "");
});

test("Hero: page with no heroBlock returns empty hero", () => {
  const page = {
    tenantId: TENANT_ID,
    isHomePage: true,
    _status: "published" as const,
    layout: [{ blockType: "featurestripBlock" }],
  };
  const result = mapGheeRoastHero(page, TENANT_ID, { fallbacksEnabled: false });
  assert.equal(result.enabled, false);
});

test("Hero: fallbacksEnabled:true cannot inject legacy content", () => {
  const result = mapGheeRoastHero(null, TENANT_ID, { fallbacksEnabled: true });
  assert.deepEqual(result, emptyGheeRoastHero());
});

// ---------------------------------------------------------------------------
// 16. Published vs draft
// ---------------------------------------------------------------------------

test("Hero: _status:draft page is rejected � returns empty hero", () => {
  const page = {
    tenantId: TENANT_ID,
    isHomePage: true,
    _status: "draft" as const,
    layout: [heroBlock()],
  };
  const result = mapGheeRoastHero(page, TENANT_ID, { fallbacksEnabled: false });
  assert.equal(result.enabled, false);
});

test("Hero: published page produces full hero data", () => {
  const result = mapGheeRoastHero(publishedHomePage(), TENANT_ID, {
    fallbacksEnabled: false,
  });
  assert.equal(result.enabled, true);
  assert.ok(result.heading.length > 0);
});

// ---------------------------------------------------------------------------
// 17. Cross-tenant rejection
// ---------------------------------------------------------------------------

test("Hero: page belonging to different tenantId is rejected", () => {
  const page = {
    tenantId: 9999,
    isHomePage: true,
    _status: "published" as const,
    layout: [heroBlock()],
  };
  const result = mapGheeRoastHero(page, TENANT_ID, { fallbacksEnabled: false });
  assert.equal(result.enabled, false);
});

test("Hero: cross-tenant media is silently dropped", () => {
  const foreignMedia = mediaDoc({ tenantId: 9999, url: "/media/foreign.jpg" });
  const page = publishedHomePage([
    heroBlock({ foregroundImage: foreignMedia }),
  ]);
  const result = mapGheeRoastHero(page, TENANT_ID);
  assert.equal(result.image, undefined);
});

// ---------------------------------------------------------------------------
// 18. stable empty-state structure
// ---------------------------------------------------------------------------

test("emptyGheeRoastHero returns structurally valid hidden data", () => {
  const empty = emptyGheeRoastHero();
  assert.equal(typeof empty.heading, "string");
  assert.equal(typeof empty.highlightedHeading, "string");
  assert.equal(typeof empty.description, "string");
  assert.equal(empty.enabled, false);
  assert.equal(empty.image, undefined);
  assert.equal(empty.primaryCTA, undefined);
});
