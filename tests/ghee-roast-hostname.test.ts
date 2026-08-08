import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveHostname } from '../src/lib/site/resolveHostname.ts'
import { resolveLocalSite } from '../src/lib/site/resolveLocalSite.ts'

const gheeRoastHosts = [
  'ghee-roast.localhost',
  'GHEE-ROAST.LOCALHOST',
  'ghee-roast.localhost:3000',
  'www.ghee-roast.localhost',
  'WWW.GHEE-ROAST.LOCALHOST:3000',
  'ghee-roast.localhost.',
  'www.ghee-roast.localhost.:3000',
  'ghee-roast.local',
  'GHEE-ROAST.LOCAL:3000',
  'ghee-roast.local.:3000',
] as const

test('documented Ghee Roast development hosts resolve deterministically', () => {
  for (const host of gheeRoastHosts) {
    // `hostname` on the resolved site is the actual normalized request hostname (used verbatim
    // for canonical URLs/sitemap/robots in production, so it must reflect the real incoming
    // domain rather than a fixed dev value) — re-derive it the same way resolveLocalSite does,
    // rather than asserting one hardcoded string across every alias in this list.
    assert.deepEqual(
      resolveLocalSite(host),
      {
        hostname: resolveHostname(host),
        key: 'ghee-roast',
        theme: 'ghee-roast',
      },
      host,
    )
  }
})

const curiousLadooHosts = [
  'localhost',
  'LOCALHOST:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
  '[::1]',
  '[::1]:3000',
  'curious-hub.localhost',
  'CURIOUS-HUB.LOCALHOST',
  'curious-hub.local',
  'curious-ladoo.localhost',
  'CURIOUS-LADOO.LOCALHOST:3000',
  'curious-ladoo.local',
] as const

test('bare localhost and Curious Ladoo development hosts resolve to Curious Ladoo (default tenant)', () => {
  for (const host of curiousLadooHosts) {
    // See the Ghee Roast test above: `hostname` mirrors the actual normalized request hostname.
    assert.deepEqual(
      resolveLocalSite(host),
      {
        hostname: resolveHostname(host),
        key: 'curious-ladoo',
        theme: 'curious-hub',
      },
      host,
    )
  }
})

test('hostname normalization handles case, ports, www, trailing dots, and bracketed loopback', () => {
  const cases = [
    [' GHEE-ROAST.LOCALHOST:3000 ', 'ghee-roast.localhost'],
    ['www.ghee-roast.localhost.:443', 'ghee-roast.localhost'],
    ['GHEE-ROAST.LOCAL.:8080', 'ghee-roast.local'],
    ['LOCALHOST.:3000', 'localhost'],
    ['127.0.0.1:3000', '127.0.0.1'],
    ['[::1]:3000', '::1'],
    ['Unknown.Example.:8080', 'unknown.example'],
  ] as const

  for (const [input, expected] of cases) {
    assert.equal(resolveHostname(input), expected, input)
  }
})

test('unknown but well-formed hosts never select a local tenant', () => {
  for (const host of [
    'unknown.example',
    'unknown.localhost:3000',
    'ghee-roast.example',
    '192.0.2.10',
    '[2001:db8::1]:3000',
  ]) {
    assert.equal(resolveLocalSite(host), null, host)
  }
})

test('ambiguous and malformed Host values are rejected', () => {
  const invalidHosts = [
    '',
    ' ',
    'ghee-roast.localhost,evil.example',
    'evil.example,ghee-roast.localhost',
    'ghee-roast.localhost:3000, evil.example',
    'ghee-roast.localhost:',
    'ghee-roast.localhost:not-a-port',
    'ghee-roast.localhost:0',
    'ghee-roast.localhost:65536',
    'ghee-roast.localhost/path',
    'https://ghee-roast.localhost',
    'user@ghee-roast.localhost',
    'ghee roast.localhost',
    '.ghee-roast.localhost',
    'ghee-roast..localhost',
    '-ghee-roast.localhost',
    'ghee-roast-.localhost',
    '[::1',
    '[::1]extra',
    '[:::]',
    '[1:2:3:4:5:6:7:8:9]',
    '[2001:db8::1]:not-a-port',
    '::1',
  ] as const

  assert.equal(resolveHostname(null), '')
  assert.equal(resolveHostname(undefined), '')

  for (const host of invalidHosts) {
    assert.equal(resolveHostname(host), '', host)
    assert.equal(resolveLocalSite(host), null, host)
  }
})
