import { spawn } from 'node:child_process'
import {
  access,
  mkdtemp,
  readFile,
  realpath,
  rm,
} from 'node:fs/promises'
import {
  basename,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path'
import { tmpdir } from 'node:os'

const DEFAULT_CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEFAULT_PORT = 3000
const DEFAULT_TIMEOUT_MS = 15_000
const EXPECTED_CHROME_MAJOR = process.env.GHEE_BROWSER_EXPECTED_CHROME_MAJOR || '150'
const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/menu',
  '/quality',
  '/delivery',
  '/catering',
  '/contact',
]
const GHEE_HOSTS = [
  'ghee-roast.localhost',
  'www.ghee-roast.localhost',
  'ghee-roast.local',
  'localhost',
  '127.0.0.1',
]
const UNKNOWN_HOST = 'unknown.localhost'
const UNKNOWN_ROUTE = '/__ghee-browser-unknown__'
const HYDRATION_PATTERN =
  /hydration|server rendered html|did not match|text content does not match|react error|tree hydrated/i

const sleep = (milliseconds) =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))

const withTimeout = (promise, milliseconds, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`${label} timed out after ${milliseconds}ms.`)),
        milliseconds,
      )
      timer.unref?.()
    }),
  ])

const parsePositiveInteger = (value, label, fallback) => {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
    throw new Error(`${label} must be an integer between 1 and 65535.`)
  }
  return parsed
}

const parseArguments = () => {
  const args = process.argv.slice(2)
  let argumentPort

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--port') {
      argumentPort = args[index + 1]
      index += 1
    } else if (argument?.startsWith('--port=')) {
      argumentPort = argument.slice('--port='.length)
    } else if (/^\d+$/.test(argument || '') && argumentPort === undefined) {
      argumentPort = argument
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }

  return {
    chromePath:
      process.env.GHEE_BROWSER_CHROME_PATH ||
      process.env.CHROME_PATH ||
      DEFAULT_CHROME_PATH,
    port: parsePositiveInteger(
      argumentPort ?? process.env.GHEE_BROWSER_PORT ?? process.env.PORT,
      'Browser verification port',
      DEFAULT_PORT,
    ),
    timeoutMs: parsePositiveInteger(
      process.env.GHEE_BROWSER_TIMEOUT_MS,
      'Browser verification timeout',
      DEFAULT_TIMEOUT_MS,
    ),
  }
}

const remoteObjectText = (value) => {
  if (!value || typeof value !== 'object') return String(value ?? '')
  if ('value' in value) {
    return typeof value.value === 'string'
      ? value.value
      : JSON.stringify(value.value)
  }
  return value.description || value.unserializableValue || value.type || ''
}

class CDPClient {
  constructor(webSocketURL) {
    this.handlers = new Map()
    this.nextID = 1
    this.pending = new Map()
    this.socket = new WebSocket(webSocketURL)
  }

  async connect(timeoutMs) {
    await withTimeout(
      new Promise((resolvePromise, reject) => {
        const onError = () => reject(new Error('Chrome DevTools WebSocket failed to connect.'))
        this.socket.addEventListener('error', onError, { once: true })
        this.socket.addEventListener(
          'open',
          () => {
            this.socket.removeEventListener('error', onError)
            resolvePromise()
          },
          { once: true },
        )
      }),
      timeoutMs,
      'Chrome DevTools WebSocket connection',
    )

    this.socket.addEventListener('message', (event) => this.handleMessage(event.data))
    this.socket.addEventListener('close', () => {
      for (const { reject } of this.pending.values()) {
        reject(new Error('Chrome DevTools WebSocket closed.'))
      }
      this.pending.clear()
    })
  }

  handleMessage(data) {
    const text =
      typeof data === 'string'
        ? data
        : data instanceof ArrayBuffer
          ? Buffer.from(data).toString('utf8')
          : Buffer.from(data).toString('utf8')
    const message = JSON.parse(text)

    if (message.id) {
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.error) {
        pending.reject(
          new Error(`${pending.method}: ${message.error.message || 'CDP command failed.'}`),
        )
      } else {
        pending.resolve(message.result || {})
      }
      return
    }

    if (!message.method) return
    for (const handler of this.handlers.get(message.method) || []) {
      try {
        handler(message.params || {})
      } catch (error) {
        console.error(`CDP event handler failed for ${message.method}:`, error)
      }
    }
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) || new Set()
    handlers.add(handler)
    this.handlers.set(method, handlers)
    return () => handlers.delete(handler)
  }

  send(method, params = {}) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`Cannot send ${method}; DevTools is not connected.`))
    }

    const id = this.nextID
    this.nextID += 1
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { method, reject, resolve: resolvePromise })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  waitFor(method, predicate = () => true, timeoutMs = DEFAULT_TIMEOUT_MS) {
    return withTimeout(
      new Promise((resolvePromise) => {
        const remove = this.on(method, (params) => {
          if (!predicate(params)) return
          remove()
          resolvePromise(params)
        })
      }),
      timeoutMs,
      method,
    )
  }

  close() {
    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close()
    }
  }
}

const waitForChildExit = async (child, timeoutMs) => {
  if (!child || child.exitCode !== null || child.signalCode !== null) return true

  return new Promise((resolvePromise) => {
    const finish = () => {
      clearTimeout(timer)
      child.removeListener('exit', finish)
      resolvePromise(true)
    }
    const timer = setTimeout(() => {
      child.removeListener('exit', finish)
      resolvePromise(false)
    }, timeoutMs)
    child.once('exit', finish)
  })
}

const launchChrome = async ({ chromePath, profilePath, timeoutMs }) => {
  await access(chromePath)

  const hostRules = [
    'MAP ghee-roast.localhost 127.0.0.1',
    'MAP www.ghee-roast.localhost 127.0.0.1',
    'MAP ghee-roast.local 127.0.0.1',
    'MAP unknown.localhost 127.0.0.1',
    'MAP localhost 127.0.0.1',
  ].join(',')

  const child = spawn(
    chromePath,
    [
      '--headless=new',
      `--user-data-dir=${profilePath}`,
      '--remote-debugging-address=127.0.0.1',
      '--remote-debugging-port=0',
      `--host-resolver-rules=${hostRules}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-features=MediaRouter,OptimizationHints,Translate',
      'about:blank',
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  )

  let output = ''
  const appendOutput = (chunk) => {
    output = `${output}${chunk.toString('utf8')}`.slice(-20_000)
  }
  child.stdout?.on('data', appendOutput)
  child.stderr?.on('data', appendOutput)

  try {
    const portFile = join(profilePath, 'DevToolsActivePort')
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeoutMs) {
      if (child.exitCode !== null) {
        throw new Error(
          `Chrome exited before DevTools was ready (code ${child.exitCode}).\n${output}`,
        )
      }

      try {
        const [portLine] = (await readFile(portFile, 'utf8')).trim().split(/\r?\n/)
        const debuggingPort = parsePositiveInteger(portLine, 'Chrome debugging port')
        const targets = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`).then(
          (response) => response.json(),
        )
        const pageTarget = targets.find(
          (target) => target.type === 'page' && target.webSocketDebuggerUrl,
        )
        if (pageTarget) {
          return {
            child,
            output: () => output,
            webSocketURL: pageTarget.webSocketDebuggerUrl,
          }
        }
      } catch {
        // Chrome may create the profile before DevToolsActivePort becomes readable.
      }

      await sleep(50)
    }

    throw new Error(`Chrome DevTools did not become ready.\n${output}`)
  } catch (error) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill()
      await waitForChildExit(child, 5_000)
    }
    throw error
  }
}

const validateAndRemoveProfile = async (profilePath) => {
  const temporaryRoot = await realpath(tmpdir())
  const resolvedProfile = await realpath(profilePath)
  const relativeProfile = relative(temporaryRoot, resolvedProfile)

  if (
    !relativeProfile ||
    relativeProfile.startsWith(`..${sep}`) ||
    relativeProfile === '..' ||
    isAbsolute(relativeProfile) ||
    !basename(resolvedProfile).startsWith('ghee-browser-')
  ) {
    throw new Error(`Refusing to remove unvalidated browser profile: ${resolvedProfile}`)
  }

  await rm(resolvedProfile, {
    force: true,
    maxRetries: 10,
    recursive: true,
    retryDelay: 200,
  })
}

const createVerifier = ({ client, port, timeoutMs }) => {
  const failures = []
  const skips = []
  const consoleMessages = []
  const logEntries = []
  const runtimeExceptions = []
  const auditIssues = []
  const requests = new Map()
  const pendingRequests = new Map()
  const responses = []
  const networkFailures = []
  const nonReadRequests = []
  const blockedNetworkIDs = new Set()

  const check = (condition, message, details) => {
    if (condition) return true
    failures.push(details === undefined ? message : `${message}: ${JSON.stringify(details)}`)
    return false
  }

  const evaluate = async (expression, awaitPromise = true) => {
    const result = await client.send('Runtime.evaluate', {
      awaitPromise,
      expression,
      returnByValue: true,
      userGesture: true,
    })
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text ||
          'Runtime evaluation failed.',
      )
    }
    return result.result?.value
  }

  client.on('Runtime.consoleAPICalled', (params) => {
    consoleMessages.push({
      text: (params.args || []).map(remoteObjectText).join(' '),
      type: params.type,
    })
  })
  client.on('Runtime.exceptionThrown', (params) => {
    runtimeExceptions.push(
      params.exceptionDetails?.exception?.description ||
        params.exceptionDetails?.text ||
        'Unknown runtime exception',
    )
  })
  client.on('Log.entryAdded', ({ entry }) => {
    logEntries.push(entry)
  })
  client.on('Audits.issueAdded', ({ issue }) => {
    auditIssues.push(issue)
  })
  client.on('Network.requestWillBeSent', (params) => {
    const record = {
      method: params.request.method,
      requestID: params.requestId,
      type: params.type,
      url: params.request.url,
    }
    requests.set(params.requestId, record)
    if (
      /^https?:/i.test(record.url) &&
      !['EventSource', 'WebSocket'].includes(record.type)
    ) {
      pendingRequests.set(params.requestId, record)
    }
  })
  client.on('Network.loadingFinished', ({ requestId }) => {
    pendingRequests.delete(requestId)
  })
  client.on('Network.loadingFailed', (params) => {
    pendingRequests.delete(params.requestId)
    networkFailures.push({
      blocked: blockedNetworkIDs.has(params.requestId),
      canceled: params.canceled === true,
      errorText: params.errorText,
      request: requests.get(params.requestId),
    })
  })
  client.on('Network.responseReceived', (params) => {
    responses.push({
      loaderID: params.loaderId,
      requestID: params.requestId,
      status: params.response.status,
      type: params.type,
      url: params.response.url,
    })
  })
  client.on('Fetch.requestPaused', (params) => {
    const method = params.request.method.toUpperCase()
    if (READ_ONLY_METHODS.has(method)) {
      void client.send('Fetch.continueRequest', {
        requestId: params.requestId,
      }).catch((error) => failures.push(error.message))
      return
    }

    nonReadRequests.push({
      method,
      url: params.request.url,
    })
    if (params.networkId) blockedNetworkIDs.add(params.networkId)
    void client.send('Fetch.failRequest', {
      errorReason: 'BlockedByClient',
      requestId: params.requestId,
    }).catch((error) => failures.push(error.message))
  })

  const waitForNetworkQuiet = async () => {
    const startedAt = Date.now()
    let quietSince = pendingRequests.size === 0 ? Date.now() : null

    while (Date.now() - startedAt < timeoutMs) {
      if (pendingRequests.size === 0) {
        quietSince ??= Date.now()
        if (Date.now() - quietSince >= 300) return
      } else {
        quietSince = null
      }
      await sleep(50)
    }

    throw new Error(
      `Network did not become idle: ${JSON.stringify([...pendingRequests.values()])}`,
    )
  }

  const waitForLocation = async (pathname) => {
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeoutMs) {
      const state = await evaluate(`({
        pathname: window.location.pathname,
        readyState: document.readyState,
      })`)
      if (state?.pathname === pathname && state.readyState === 'complete') {
        await waitForNetworkQuiet()
        await sleep(200)
        return
      }
      await sleep(50)
    }
    throw new Error(`Location did not become ready at ${pathname}.`)
  }

  const documentStatusAfter = (responseStart, finalURL, loaderID) => {
    const final = new URL(finalURL)
    const candidates = responses.slice(responseStart).filter((response) => {
      if (response.type !== 'Document') return false
      const responseURL = new URL(response.url)
      return (
        responseURL.host === final.host &&
        responseURL.pathname === final.pathname &&
        (!loaderID || response.loaderID === loaderID)
      )
    })
    return candidates.at(-1)?.status
  }

  const navigate = async (url) => {
    const responseStart = responses.length
    const loaded = client.waitFor('Page.loadEventFired', () => true, timeoutMs)
    const navigation = await client.send('Page.navigate', { url })
    if (navigation.errorText) {
      throw new Error(`Navigation failed for ${url}: ${navigation.errorText}`)
    }
    await loaded
    const finalURL = await evaluate('window.location.href')
    await waitForLocation(new URL(finalURL).pathname)
    return {
      finalURL,
      status: documentStatusAfter(
        responseStart,
        finalURL,
        navigation.loaderId,
      ),
    }
  }

  const reload = async () => {
    const loaded = client.waitFor('Page.loadEventFired', () => true, timeoutMs)
    await client.send('Page.reload', { ignoreCache: true })
    await loaded
    const pathname = await evaluate('window.location.pathname')
    await waitForLocation(pathname)
  }

  const snapshot = () =>
    evaluate(`(() => {
      const root = document.documentElement
      const images = [...document.images]
      return {
        brokenImages: images
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        description: document.querySelector('meta[name="description"]')?.content || '',
        hasMain: Boolean(document.querySelector('main')),
        hasTheme: Boolean(document.querySelector('[data-theme-site="ghee-roast"]')),
        h1Count: document.querySelectorAll('main h1').length,
        h1Text: document.querySelector('main h1')?.textContent?.trim() || '',
        nextErrorOverlay: Boolean(
          document.querySelector('nextjs-portal, [data-nextjs-toast], #nextjs__container_errors_desc')
        ),
        overflow: root.scrollWidth - root.clientWidth,
        pathname: window.location.pathname,
        title: document.title,
      }
    })()`)

  const verifySnapshot = async (label) => {
    const state = await snapshot()
    check(state.hasTheme, `${label} did not render the Ghee Roast theme`)
    check(state.hasMain, `${label} did not render a main element`)
    check(state.h1Count === 1, `${label} must render exactly one H1`, state)
    check(Boolean(state.h1Text), `${label} rendered an empty H1`)
    check(Boolean(state.title), `${label} rendered an empty metadata title`)
    check(Boolean(state.description), `${label} rendered an empty metadata description`)
    check(state.overflow <= 1, `${label} has horizontal overflow`, state.overflow)
    check(!state.nextErrorOverlay, `${label} rendered a Next.js error overlay`)
    check(state.brokenImages.length === 0, `${label} has broken images`, state.brokenImages)
    return state
  }

  const clickAndWaitForPath = async (selector, pathname) => {
    const clicked = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)})
      if (!(element instanceof HTMLElement)) return false
      element.click()
      return true
    })()`)
    if (!check(clicked, `Could not click ${selector}`)) return false
    await waitForLocation(pathname)
    return true
  }

  const setDesktopViewport = async () => {
    await client.send('Emulation.setDeviceMetricsOverride', {
      deviceScaleFactor: 1,
      height: 900,
      mobile: false,
      width: 1440,
    })
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: false })
  }

  const setMobileViewport = async () => {
    await client.send('Emulation.setDeviceMetricsOverride', {
      deviceScaleFactor: 2,
      height: 844,
      mobile: true,
      screenHeight: 844,
      screenOrientation: { angle: 0, type: 'portraitPrimary' },
      screenWidth: 390,
      width: 390,
    })
    await client.send('Emulation.setTouchEmulationEnabled', {
      configuration: 'mobile',
      enabled: true,
      maxTouchPoints: 5,
    })
  }

  const verifyRoutesAndHosts = async () => {
    await setDesktopViewport()

    for (const pathname of PUBLIC_ROUTES) {
      const url = `http://ghee-roast.localhost:${port}${pathname}`
      const result = await navigate(url)
      check(result.status === 200, `${pathname} returned ${result.status}; expected 200`)
      await verifySnapshot(pathname)
    }

    for (const host of GHEE_HOSTS) {
      const result = await navigate(`http://${host}:${port}/`)
      check(result.status === 200, `${host} returned ${result.status}; expected 200`)
      const state = await snapshot()
      check(state.hasTheme, `${host} did not resolve the Ghee Roast theme`)
      check(state.overflow <= 1, `${host} has horizontal overflow`, state.overflow)
    }

    const unknownRoute = await navigate(
      `http://ghee-roast.localhost:${port}${UNKNOWN_ROUTE}`,
    )
    check(
      unknownRoute.status === 404,
      `${UNKNOWN_ROUTE} returned ${unknownRoute.status}; expected 404`,
    )

    const unknownHost = await navigate(`http://${UNKNOWN_HOST}:${port}/`)
    check(
      unknownHost.status === 404,
      `${UNKNOWN_HOST} returned ${unknownHost.status}; expected 404`,
    )
  }

  const verifyDesktopInteractions = async () => {
    await setDesktopViewport()
    await navigate(`http://ghee-roast.localhost:${port}/`)

    const navigationState = await evaluate(`(() => {
      const navigation = document.querySelector('nav[aria-label="Primary navigation"]')
      const toggle = document.querySelector(
        'button[aria-controls="ghee-roast-mobile-menu"]'
      )
      return {
        navigationDisplay: navigation ? getComputedStyle(navigation).display : null,
        toggleDisplay: toggle ? getComputedStyle(toggle).display : null,
      }
    })()`)
    check(
      navigationState?.navigationDisplay &&
        navigationState.navigationDisplay !== 'none',
      'Desktop primary navigation is not visible',
      navigationState,
    )
    check(
      !navigationState?.toggleDisplay || navigationState.toggleDisplay === 'none',
      'Mobile toggle is visible at the desktop viewport',
      navigationState,
    )

    const dropdown = await evaluate(`(() => {
      const trigger = document.querySelector(
        'nav[aria-label="Primary navigation"] a[href="/menu"]'
      )
      const container = trigger?.parentElement
      const child = container?.querySelector('a[href*="/menu?location="]')
      const menu = child?.parentElement
      if (!(trigger instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
        return null
      }
      const rect = trigger.getBoundingClientRect()
      return {
        childCount: menu.querySelectorAll('a').length,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    })()`)
    if (check(dropdown, 'Desktop Menu dropdown is not available')) {
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: dropdown.x,
        y: dropdown.y,
      })
      await sleep(350)
      const hoverState = await evaluate(`(() => {
        const trigger = document.querySelector(
          'nav[aria-label="Primary navigation"] a[href="/menu"]'
        )
        const menu = trigger?.parentElement?.querySelector(
          'a[href*="/menu?location="]'
        )?.parentElement
        if (!(menu instanceof HTMLElement)) return null
        const style = getComputedStyle(menu)
        return { opacity: Number(style.opacity), visibility: style.visibility }
      })()`)
      check(
        hoverState?.visibility === 'visible' && hoverState.opacity > 0.9,
        'Desktop dropdown did not open on hover',
        hoverState,
      )

      await evaluate(`document.querySelector(
        'nav[aria-label="Primary navigation"] a[href="/menu"]'
      )?.focus()`)
      await sleep(350)
      const focusVisibility = await evaluate(`(() => {
        const trigger = document.querySelector(
          'nav[aria-label="Primary navigation"] a[href="/menu"]'
        )
        const menu = trigger?.parentElement?.querySelector(
          'a[href*="/menu?location="]'
        )?.parentElement
        return menu instanceof HTMLElement ? getComputedStyle(menu).visibility : null
      })()`)
      check(focusVisibility === 'visible', 'Desktop dropdown did not open on focus')
      check(dropdown.childCount > 0, 'Desktop dropdown has no child links')
    }

    if (
      await clickAndWaitForPath(
        'nav[aria-label="Primary navigation"] a[href="/about"]',
        '/about',
      )
    ) {
      const about = await snapshot()
      check(about.h1Count === 1, 'Client navigation to /about did not render its H1')
    }
    await clickAndWaitForPath(
      'nav[aria-label="Primary navigation"] a[href="/menu"]',
      '/menu',
    )

    const history = await client.send('Page.getNavigationHistory')
    const backEntry = history.entries[history.currentIndex - 1]
    const forwardEntry = history.entries[history.currentIndex]
    if (
      check(
        backEntry && forwardEntry,
        'Browser history did not contain back and forward entries',
      )
    ) {
      await client.send('Page.navigateToHistoryEntry', {
        entryId: backEntry.id,
      })
      await waitForLocation('/about')
      check(
        (await evaluate('window.location.pathname')) === '/about',
        'Browser Back did not restore /about',
      )

      await client.send('Page.navigateToHistoryEntry', {
        entryId: forwardEntry.id,
      })
      await waitForLocation('/menu')
      check(
        (await evaluate('window.location.pathname')) === '/menu',
        'Browser Forward did not restore /menu',
      )
    }

    await reload()
    check(
      (await evaluate('window.location.pathname')) === '/menu',
      'Reload did not preserve /menu',
    )
    await verifySnapshot('/menu after reload')
  }

  const verifyMenuFiltering = async () => {
    await setDesktopViewport()
    await navigate(`http://ghee-roast.localhost:${port}/menu`)

    const initial = await evaluate(`(() => {
      const locationGroup = document.querySelector(
        '[role="group"][aria-label="Choose location"]'
      )
      const categoryGroup = document.querySelector(
        '[role="group"][aria-label="Filter menu by category"]'
      )
      const categoryButtons = [...(categoryGroup?.querySelectorAll('button') || [])]
      const container = categoryGroup?.parentElement
      return {
        cards: [...(container?.querySelectorAll('article h3') || [])]
          .map((heading) => heading.textContent?.trim()),
        categoryButtonCount: categoryButtons.length,
        nonAllCategoryCount: categoryButtons.filter(
          (button, index) => index > 0 && !button.disabled
        ).length,
        locationButtonCount: locationGroup?.querySelectorAll('button').length || 0,
        pressedCategoryCount:
          categoryGroup?.querySelectorAll('button[aria-pressed="true"]').length || 0,
        pressedLocationCount:
          locationGroup?.querySelectorAll('button[aria-pressed="true"]').length || 0,
      }
    })()`)
    check(initial.categoryButtonCount > 1, 'Menu category filters are not available', initial)
    check(initial.locationButtonCount > 0, 'Menu location filters are not available', initial)
    check(initial.pressedCategoryCount === 1, 'Menu must have one pressed category', initial)
    check(initial.pressedLocationCount === 1, 'Menu must have one pressed location', initial)
    check(initial.cards.length > 0, 'Menu rendered no food cards', initial)

    const categoryResult = await evaluate(`(() => {
      const group = document.querySelector(
        '[role="group"][aria-label="Filter menu by category"]'
      )
      const buttons = [...(group?.querySelectorAll('button') || [])]
      const target = buttons.find((button, index) => index > 0 && !button.disabled)
      if (!(target instanceof HTMLButtonElement)) return null
      target.click()
      return target.textContent?.trim() || ''
    })()`)
    if (check(categoryResult, 'No non-All menu category could be selected')) {
      await sleep(250)
      const filtered = await evaluate(`(() => {
        const group = document.querySelector(
          '[role="group"][aria-label="Filter menu by category"]'
        )
        const container = group?.parentElement
        return {
          cards: [...(container?.querySelectorAll('article h3') || [])]
            .map((heading) => heading.textContent?.trim()),
          emptyStateVisible: [...(container?.querySelectorAll('p') || [])]
            .some((paragraph) => /no menu items|nothing available/i.test(
              paragraph.textContent || ''
            )),
          pressed:
            group?.querySelector('button[aria-pressed="true"]')?.textContent?.trim() || '',
        }
      })()`)
      check(filtered.pressed === categoryResult, 'Selected category was not pressed', filtered)
      check(
        filtered.cards.length > 0 &&
          filtered.cards.every((card) => typeof card === 'string' && card.length > 0) &&
          !filtered.emptyStateVisible,
        'Selected category did not render valid matching menu cards',
        filtered,
      )
      if (initial.nonAllCategoryCount > 1) {
        check(
          JSON.stringify(filtered.cards) !== JSON.stringify(initial.cards),
          'Category selection did not change the visible menu cards',
          filtered,
        )
      }
    }

    const locationResult = await evaluate(`(() => {
      const group = document.querySelector(
        '[role="group"][aria-label="Choose location"]'
      )
      const buttons = [...(group?.querySelectorAll('button') || [])]
      const target = buttons[1] || buttons[0]
      if (!(target instanceof HTMLButtonElement)) return null
      target.click()
      return target.textContent?.trim() || ''
    })()`)
    if (check(locationResult, 'No menu location could be selected')) {
      await sleep(250)
      const selectedLocation = await evaluate(`document.querySelector(
        '[role="group"][aria-label="Choose location"] button[aria-pressed="true"]'
      )?.textContent?.trim() || ''`)
      check(
        selectedLocation === locationResult,
        'Selected location was not pressed',
        { expected: locationResult, selectedLocation },
      )
    }

    await navigate(
      `http://ghee-roast.localhost:${port}/menu?location=gurugram`,
    )
    const queryLocation = await evaluate(`document.querySelector(
      '[role="group"][aria-label="Choose location"] button[aria-pressed="true"]'
    )?.textContent?.trim() || ''`)
    check(
      /gurugram/i.test(queryLocation),
      'The location query string did not initialize the Gurugram selection',
      queryLocation,
    )
  }

  const verifyMobileInteractions = async () => {
    await setMobileViewport()
    await navigate(`http://ghee-roast.localhost:${port}/`)

    const toggleState = await evaluate(`(() => {
      const button = document.querySelector(
        'button[aria-controls="ghee-roast-mobile-menu"]'
      )
      return button instanceof HTMLButtonElement
        ? { display: getComputedStyle(button).display }
        : null
    })()`)
    if (!toggleState) {
      skips.push('Mobile navigation toggle was not rendered.')
      return
    }
    check(toggleState.display !== 'none', 'Mobile navigation toggle is hidden', toggleState)

    await evaluate(`document.querySelector(
      'button[aria-controls="ghee-roast-mobile-menu"]'
    )?.click()`)
    await sleep(350)
    const opened = await evaluate(`(() => {
      const button = document.querySelector(
        'button[aria-controls="ghee-roast-mobile-menu"]'
      )
      const menu = document.querySelector('#ghee-roast-mobile-menu')
      const style = menu ? getComputedStyle(menu) : null
      return {
        bodyOverflow: document.body.style.overflow,
        childLinks: menu?.querySelectorAll('a[href*="?location="]').length || 0,
        expanded: button?.getAttribute('aria-expanded'),
        opacity: style ? Number(style.opacity) : 0,
        pointerEvents: style?.pointerEvents || '',
      }
    })()`)
    check(opened.expanded === 'true', 'Mobile navigation did not set aria-expanded=true', opened)
    check(opened.pointerEvents !== 'none' && opened.opacity > 0.9, 'Mobile navigation is not visibly open', opened)
    check(opened.bodyOverflow === 'hidden', 'Opening mobile navigation did not lock body scrolling', opened)
    check(opened.childLinks > 0, 'Mobile navigation omitted dropdown child links', opened)

    await client.send('Input.dispatchKeyEvent', {
      code: 'Escape',
      key: 'Escape',
      type: 'keyDown',
      windowsVirtualKeyCode: 27,
    })
    await client.send('Input.dispatchKeyEvent', {
      code: 'Escape',
      key: 'Escape',
      type: 'keyUp',
      windowsVirtualKeyCode: 27,
    })
    await sleep(350)
    const closed = await evaluate(`(() => {
      const button = document.querySelector(
        'button[aria-controls="ghee-roast-mobile-menu"]'
      )
      const menu = document.querySelector('#ghee-roast-mobile-menu')
      return {
        bodyOverflow: document.body.style.overflow,
        expanded: button?.getAttribute('aria-expanded'),
        pointerEvents: menu ? getComputedStyle(menu).pointerEvents : '',
      }
    })()`)
    check(closed.expanded === 'false', 'Escape did not close mobile navigation', closed)
    check(closed.pointerEvents === 'none', 'Closed mobile navigation still accepts pointer events', closed)
    check(closed.bodyOverflow !== 'hidden', 'Escape did not restore body scrolling', closed)

    await verifySnapshot('mobile home')
  }

  const verifyContactStyleFormsOnCurrentPage = async ({
    label,
    required,
  }) => {
    const attemptedBefore = nonReadRequests.length
    const forms = await evaluate(`(() => {
      const matches = [...document.forms].filter((form) =>
        form.querySelector('[name="name"]') &&
        form.querySelector('[name="email"]') &&
        form.querySelector('[name="message"]') &&
        !form.querySelector('[name="date"]')
      )

      return matches.map((form) => {
        form.reset()
        const requiredControls = [
          ...form.querySelectorAll('input[required], select[required], textarea[required]')
        ]
        for (const control of requiredControls) control.value = ''
        const blankRequiredRejected =
          requiredControls.length > 0 &&
          requiredControls.every((control) => !control.checkValidity())
        const email = form.querySelector('input[type="email"]')
        if (email instanceof HTMLInputElement) email.value = 'not-an-email'
        return {
          blankRequiredRejected,
          hasEmail: email instanceof HTMLInputElement,
          hasPhone: form.querySelector('input[type="tel"]') instanceof HTMLInputElement,
          heading: form.querySelector('h2')?.textContent?.trim() || '',
          invalidEmailRejected:
            email instanceof HTMLInputElement && !email.checkValidity(),
          requiredCount: requiredControls.length,
        }
      })
    })()`)

    if (forms.length === 0) {
      if (required) {
        check(false, `${label} form was not rendered`)
      } else {
        skips.push(`${label} form was not rendered; no browser validation was applicable.`)
      }
      return 0
    }

    for (const form of forms) {
      check(form.requiredCount > 0, `${label} form has no required fields`, form)
      check(
        form.blankRequiredRejected,
        `${label} form accepted blank required fields`,
        form,
      )
      check(form.hasEmail, `${label} form has no email field`, form)
      check(
        form.invalidEmailRejected,
        `${label} form accepted an invalid email address`,
        form,
      )
    }

    const phoneSubmissions = await evaluate(`(() => {
      const matches = [...document.forms].filter((form) =>
        form.querySelector('[name="name"]') &&
        form.querySelector('[name="email"]') &&
        form.querySelector('[name="message"]') &&
        !form.querySelector('[name="date"]') &&
        form.querySelector('input[type="tel"]')
      )
      const fill = (form, invalidPhone) => {
        form.reset()
        for (const control of form.elements) {
          if (
            !(
              control instanceof HTMLInputElement ||
              control instanceof HTMLSelectElement ||
              control instanceof HTMLTextAreaElement
            ) ||
            control.disabled
          ) continue
          if (control instanceof HTMLSelectElement) {
            const option = [...control.options].find(
              (candidate) => !candidate.disabled && candidate.value
            )
            control.value = option?.value || ''
          } else if (control.name === 'email') {
            control.value = 'browser.validation@example.com'
          } else if (control.name === 'phone') {
            control.value = invalidPhone
          } else if (control instanceof HTMLTextAreaElement) {
            control.value = 'Browser-only validation check.'
          } else if (control.type !== 'submit') {
            control.value = 'Browser Validation'
          }
        }
      }

      return matches.map((form) => {
        fill(form, '12345')
        const event = new Event('submit', { bubbles: true, cancelable: true })
        const dispatchResult = form.dispatchEvent(event)
        return {
          defaultPrevented: event.defaultPrevented,
          dispatchResult,
          heading: form.querySelector('h2')?.textContent?.trim() || '',
        }
      })
    })()`)
    await sleep(200)

    const phoneFeedback = await evaluate(`(() =>
      [...document.forms]
        .filter((form) =>
          form.querySelector('[name="name"]') &&
          form.querySelector('[name="email"]') &&
          form.querySelector('[name="message"]') &&
          !form.querySelector('[name="date"]') &&
          form.querySelector('input[type="tel"]')
        )
        .map((form) => ({
          feedback: form.querySelector('[role="status"]')?.textContent?.trim() || '',
          heading: form.querySelector('h2')?.textContent?.trim() || '',
        }))
    )()`)

    for (const submission of phoneSubmissions) {
      check(
        submission.defaultPrevented && submission.dispatchResult === false,
        `${label} invalid-mobile validation was not handled in the browser`,
        submission,
      )
    }
    for (const feedback of phoneFeedback) {
      check(
        /valid 10-digit Indian mobile/i.test(feedback.feedback),
        `${label} form did not explain the invalid Indian mobile number`,
        feedback,
      )
    }

    check(
      nonReadRequests.length === attemptedBefore,
      `${label} invalid-form checks attempted an HTTP write`,
      nonReadRequests.slice(attemptedBefore),
    )
    return forms.length
  }

  const verifyHomepageNewsletter = async () => {
    await navigate(`http://ghee-roast.localhost:${port}/`)
    const attemptedBefore = nonReadRequests.length
    const newsletters = await evaluate(`(() =>
      [...document.forms]
        .filter((form) => form.querySelector('#newsletter-email'))
        .map((form) => {
          form.reset()
          const email = form.querySelector('#newsletter-email')
          if (!(email instanceof HTMLInputElement)) return null
          const blankRequiredRejected = !email.checkValidity()
          email.value = 'not-an-email'
          email.dispatchEvent(new Event('input', { bubbles: true }))
          return {
            blankRequiredRejected,
            formRejected: !form.checkValidity(),
            invalidEmailRejected: !email.checkValidity(),
            required: email.required,
          }
        })
        .filter(Boolean)
    )()`)

    if (newsletters.length === 0) {
      skips.push(
        'Homepage newsletter is disabled or not rendered; no newsletter validation was applicable.',
      )
    }
    for (const newsletter of newsletters) {
      check(newsletter.required, 'Homepage newsletter email is not required', newsletter)
      check(
        newsletter.blankRequiredRejected,
        'Homepage newsletter accepted a blank required email',
        newsletter,
      )
      check(
        newsletter.invalidEmailRejected && newsletter.formRejected,
        'Homepage newsletter accepted an invalid email address',
        newsletter,
      )
    }

    check(
      nonReadRequests.length === attemptedBefore,
      'Homepage newsletter validation attempted an HTTP write',
      nonReadRequests.slice(attemptedBefore),
    )
  }

  const verifyReservationFormsOnCurrentPage = async (route) => {
    const attemptedBefore = nonReadRequests.length
    const nativeValidation = await evaluate(`(() => {
      const forms = [...document.forms].filter((form) =>
        form.querySelector('input[name="date"]') &&
        form.querySelector('input[name="time"]') &&
        form.querySelector('input[name="guests"]')
      )

      return forms.map((form) => {
        form.reset()
        const requiredControls = [
          ...form.querySelectorAll('input[required], select[required], textarea[required]')
        ]
        for (const control of requiredControls) control.value = ''
        const blankRequiredRejected =
          requiredControls.length > 0 &&
          requiredControls.every((control) => !control.checkValidity())
        const email = form.querySelector('input[type="email"]')
        const phone = form.querySelector('input[type="tel"]')
        const date = form.querySelector('input[name="date"]')
        const time = form.querySelector('input[name="time"]')
        const guests = form.querySelector('input[name="guests"]')
        if (email instanceof HTMLInputElement) email.value = 'not-an-email'
        const invalidEmailRejected =
          email instanceof HTMLInputElement && !email.checkValidity()
        if (date instanceof HTMLInputElement) date.value = 'not-a-date'
        const invalidDateRejected =
          date instanceof HTMLInputElement && !date.checkValidity()
        if (time instanceof HTMLInputElement) time.value = '25:99'
        const invalidTimeRejected =
          time instanceof HTMLInputElement && !time.checkValidity()
        if (guests instanceof HTMLInputElement) guests.value = '0'
        const guestMinimumRejected =
          guests instanceof HTMLInputElement && !guests.checkValidity()
        if (guests instanceof HTMLInputElement) guests.value = '51'
        const guestMaximumRejected =
          guests instanceof HTMLInputElement && !guests.checkValidity()
        return {
          blankRequiredRejected,
          guestMaximum: guests?.getAttribute('max') || '',
          guestMaximumRejected,
          guestMinimum: guests?.getAttribute('min') || '',
          guestMinimumRejected,
          hasPhone: phone instanceof HTMLInputElement,
          invalidDateRejected,
          invalidEmailRejected,
          invalidTimeRejected,
          requiredCount: requiredControls.length,
        }
      })
    })()`)

    for (const form of nativeValidation) {
      check(form.requiredCount > 0, `Reservation form at ${route} has no required fields`, form)
      check(
        form.blankRequiredRejected,
        `Reservation form at ${route} accepted blank required fields`,
        form,
      )
      check(
        form.invalidEmailRejected,
        `Reservation form at ${route} accepted an invalid email address`,
        form,
      )
      check(
        form.hasPhone,
        `Reservation form at ${route} has no Indian mobile field`,
        form,
      )
      check(
        form.invalidDateRejected && form.invalidTimeRejected,
        `Reservation form at ${route} accepted an invalid date or time`,
        form,
      )
      check(
        form.guestMinimum === '1' &&
          form.guestMaximum === '50' &&
          form.guestMinimumRejected &&
          form.guestMaximumRejected,
        `Reservation form at ${route} did not enforce guest limits 1 through 50`,
        form,
      )
    }

    const phoneSubmissions = await evaluate(`(() => {
      const forms = [...document.forms].filter((form) =>
        form.querySelector('input[name="date"]') &&
        form.querySelector('input[name="time"]') &&
        form.querySelector('input[name="guests"]')
      )
      const fill = (form, { date, phone }) => {
        form.reset()
        for (const control of form.elements) {
          if (
            !(
              control instanceof HTMLInputElement ||
              control instanceof HTMLSelectElement ||
              control instanceof HTMLTextAreaElement
            ) ||
            control.disabled
          ) continue
          if (control instanceof HTMLSelectElement) {
            const option = [...control.options].find(
              (candidate) => !candidate.disabled && candidate.value
            )
            control.value = option?.value || ''
          } else if (control.name === 'email') {
            control.value = 'browser.validation@example.com'
          } else if (control.name === 'phone') {
            control.value = phone
          } else if (control.name === 'date') {
            control.value = date
          } else if (control.name === 'time') {
            control.value = '18:30'
          } else if (control.name === 'guests') {
            control.value = '2'
          } else if (control instanceof HTMLTextAreaElement) {
            control.value = 'Browser-only validation check.'
          } else if (control.type !== 'submit') {
            control.value = 'Browser Validation'
          }
        }
      }

      return forms.map((form) => {
        fill(form, { date: '2099-12-31', phone: '12345' })
        const event = new Event('submit', { bubbles: true, cancelable: true })
        const dispatchResult = form.dispatchEvent(event)
        return {
          defaultPrevented: event.defaultPrevented,
          dispatchResult,
        }
      })
    })()`)
    await sleep(200)

    const phoneFeedback = await evaluate(`(() =>
      [...document.forms]
        .filter((form) =>
          form.querySelector('input[name="date"]') &&
          form.querySelector('input[name="time"]') &&
          form.querySelector('input[name="guests"]')
        )
        .map((form) => form.querySelector('[role="status"]')?.textContent?.trim() || '')
    )()`)
    for (let index = 0; index < phoneSubmissions.length; index += 1) {
      const submission = phoneSubmissions[index]
      check(
        submission.defaultPrevented && submission.dispatchResult === false,
        `Reservation form at ${route} did not handle invalid mobile validation`,
        submission,
      )
      check(
        /valid 10-digit Indian mobile/i.test(phoneFeedback[index] || ''),
        `Reservation form at ${route} did not explain the invalid Indian mobile number`,
        phoneFeedback[index],
      )
    }

    const pastDateSubmissions = await evaluate(`(() => {
      const forms = [...document.forms].filter((form) =>
        form.querySelector('input[name="date"]') &&
        form.querySelector('input[name="time"]') &&
        form.querySelector('input[name="guests"]')
      )
      const fill = (form) => {
        form.reset()
        for (const control of form.elements) {
          if (
            !(
              control instanceof HTMLInputElement ||
              control instanceof HTMLSelectElement ||
              control instanceof HTMLTextAreaElement
            ) ||
            control.disabled
          ) continue
          if (control instanceof HTMLSelectElement) {
            const option = [...control.options].find(
              (candidate) => !candidate.disabled && candidate.value
            )
            control.value = option?.value || ''
          } else if (control.name === 'email') {
            control.value = 'browser.validation@example.com'
          } else if (control.name === 'phone') {
            control.value = '9876543210'
          } else if (control.name === 'date') {
            control.value = '2000-01-01'
          } else if (control.name === 'time') {
            control.value = '18:30'
          } else if (control.name === 'guests') {
            control.value = '2'
          } else if (control instanceof HTMLTextAreaElement) {
            control.value = 'Browser-only validation check.'
          } else if (control.type !== 'submit') {
            control.value = 'Browser Validation'
          }
        }
      }

      return forms.map((form) => {
        fill(form)
        const date = form.querySelector('input[name="date"]')
        const nativePastRejected =
          date instanceof HTMLInputElement && !date.checkValidity()
        if (nativePastRejected) {
          return {
            defaultPrevented: false,
            dispatchResult: true,
            nativePastRejected,
          }
        }
        const event = new Event('submit', { bubbles: true, cancelable: true })
        const dispatchResult = form.dispatchEvent(event)
        return {
          defaultPrevented: event.defaultPrevented,
          dispatchResult,
          nativePastRejected,
        }
      })
    })()`)
    await sleep(200)

    const pastDateFeedback = await evaluate(`(() =>
      [...document.forms]
        .filter((form) =>
          form.querySelector('input[name="date"]') &&
          form.querySelector('input[name="time"]') &&
          form.querySelector('input[name="guests"]')
        )
        .map((form) => form.querySelector('[role="status"]')?.textContent?.trim() || '')
    )()`)
    for (let index = 0; index < pastDateSubmissions.length; index += 1) {
      const submission = pastDateSubmissions[index]
      if (submission.nativePastRejected) continue
      check(
        submission.defaultPrevented && submission.dispatchResult === false,
        `Reservation form at ${route} did not handle a past date in the browser`,
        submission,
      )
      check(
        /past|future|valid reservation date/i.test(pastDateFeedback[index] || ''),
        `Reservation form at ${route} did not explain why a past date is invalid`,
        pastDateFeedback[index],
      )
    }

    check(
      nonReadRequests.length === attemptedBefore,
      `Reservation invalid-form checks at ${route} attempted an HTTP write`,
      nonReadRequests.slice(attemptedBefore),
    )
    return nativeValidation.length
  }

  const verifyFormsWithoutSubmission = async () => {
    await setDesktopViewport()

    await navigate(`http://ghee-roast.localhost:${port}/contact`)
    await verifyContactStyleFormsOnCurrentPage({
      label: 'Contact',
      required: true,
    })

    await navigate(`http://ghee-roast.localhost:${port}/catering`)
    await verifyContactStyleFormsOnCurrentPage({
      label: 'Catering',
      required: false,
    })

    await verifyHomepageNewsletter()

    let reservationFormCount = 0
    for (const route of PUBLIC_ROUTES) {
      await navigate(`http://ghee-roast.localhost:${port}${route}`)
      reservationFormCount += await verifyReservationFormsOnCurrentPage(route)
    }
    if (reservationFormCount === 0) {
      skips.push(
        'No reservation form is rendered on the current Ghee Roast routes; no reservation browser validation was applicable.',
      )
    }

    skips.push(
      'Form duplicate-click, loading, success, and backend-error behavior remains covered by deterministic unit tests; browser checks intentionally issue no writes.',
    )
  }

  const finalize = () => {
    for (const request of nonReadRequests) {
      failures.push(
        `Blocked non-read browser request: ${request.method} ${request.url}`,
      )
    }

    for (const exception of runtimeExceptions) {
      failures.push(`Browser runtime exception: ${exception}`)
    }

    for (const message of consoleMessages) {
      if (message.type === 'error' || HYDRATION_PATTERN.test(message.text)) {
        failures.push(`Browser console ${message.type}: ${message.text}`)
      }
    }

    for (const entry of logEntries) {
      const expected404 =
        entry.url &&
        (() => {
          const url = new URL(entry.url)
          return (
            (url.hostname === 'ghee-roast.localhost' &&
              url.pathname === UNKNOWN_ROUTE) ||
            url.hostname === UNKNOWN_HOST
          )
        })()
      if (entry.level === 'error' && !expected404) {
        failures.push(`Browser log error: ${entry.text}${entry.url ? ` (${entry.url})` : ''}`)
      }
      if (HYDRATION_PATTERN.test(entry.text || '')) {
        failures.push(`Hydration-related browser log: ${entry.text}`)
      }
    }

    for (const response of responses) {
      if (response.status < 400) continue
      const url = new URL(response.url)
      const expected404 =
        response.type === 'Document' &&
        response.status === 404 &&
        ((url.hostname === 'ghee-roast.localhost' &&
          url.pathname === UNKNOWN_ROUTE) ||
          url.hostname === UNKNOWN_HOST)
      if (!expected404) {
        failures.push(
          `HTTP ${response.status} for ${response.type} ${response.url}`,
        )
      }
    }

    for (const failure of networkFailures) {
      if (failure.blocked) continue
      failures.push(
        `Network request failed: ${failure.request?.method || ''} ${
          failure.request?.url || 'unknown URL'
        } (${failure.errorText}${failure.canceled ? ', canceled' : ''})`,
      )
    }

    const hydrationMessages = [
      ...consoleMessages.map((message) => message.text),
      ...logEntries.map((entry) => entry.text || ''),
      ...runtimeExceptions,
    ].filter((message) => HYDRATION_PATTERN.test(message))

    return {
      auditIssueCount: auditIssues.length,
      consoleMessageCount: consoleMessages.length,
      failures: [...new Set(failures)],
      hydrationMessageCount: hydrationMessages.length,
      networkFailureCount: networkFailures.filter((failure) => !failure.blocked).length,
      nonReadRequestCount: nonReadRequests.length,
      requestCount: requests.size,
      responseCount: responses.length,
      skips,
    }
  }

  return {
    check,
    evaluate,
    finalize,
    verifyDesktopInteractions,
    verifyFormsWithoutSubmission,
    verifyMenuFiltering,
    verifyMobileInteractions,
    verifyRoutesAndHosts,
  }
}

async function main() {
  if (typeof WebSocket !== 'function') {
    throw new Error('This harness requires a Node.js runtime with global WebSocket support.')
  }

  const options = parseArguments()
  const profilePath = await mkdtemp(join(tmpdir(), 'ghee-browser-'))
  let browser
  let client
  let result
  let cleanupError
  let runError

  try {
    browser = await launchChrome({
      chromePath: resolve(options.chromePath),
      profilePath,
      timeoutMs: options.timeoutMs,
    })
    client = new CDPClient(browser.webSocketURL)
    await client.connect(options.timeoutMs)

    const version = await client.send('Browser.getVersion')
    const majorVersion = /(?:Headless)?Chrome\/(\d+)/.exec(version.product || '')?.[1]
    if (majorVersion !== EXPECTED_CHROME_MAJOR) {
      throw new Error(
        `Expected Chrome ${EXPECTED_CHROME_MAJOR}, received ${version.product || 'unknown'}.`,
      )
    }

    await Promise.all([
      client.send('Page.enable'),
      client.send('Runtime.enable'),
      client.send('Log.enable'),
      client.send('Network.enable'),
      client.send('Performance.enable'),
      client.send('Audits.enable'),
      client.send('Fetch.enable', {
        patterns: [{ requestStage: 'Request', urlPattern: '*' }],
      }),
    ])
    await client.send('Network.setCacheDisabled', { cacheDisabled: true })
    await client.send('Page.setLifecycleEventsEnabled', { enabled: true })

    const verifier = createVerifier({
      client,
      port: options.port,
      timeoutMs: options.timeoutMs,
    })
    await verifier.verifyRoutesAndHosts()
    await verifier.verifyDesktopInteractions()
    await verifier.verifyMenuFiltering()
    await verifier.verifyMobileInteractions()
    await verifier.verifyFormsWithoutSubmission()
    result = verifier.finalize()
  } catch (error) {
    runError = error
  } finally {
    if (client) {
      try {
        await client.send('Browser.close')
      } catch {
        // Chrome may close the DevTools socket before acknowledging Browser.close.
      }
      client.close()
    }

    if (browser?.child) {
      const exited = await waitForChildExit(browser.child, 5_000)
      if (!exited) {
        browser.child.kill()
        const killed = await waitForChildExit(browser.child, 5_000)
        if (!killed) {
          cleanupError = new Error(
            `Chrome PID ${browser.child.pid} did not exit after an exact-PID termination request.`,
          )
        }
      }
    }

    try {
      await validateAndRemoveProfile(profilePath)
    } catch (error) {
      cleanupError ??= error
    }
  }

  if (cleanupError && runError) {
    throw new AggregateError(
      [runError, cleanupError],
      'Browser verification and isolated-profile cleanup both failed.',
    )
  }
  if (cleanupError) throw cleanupError
  if (runError) throw runError
  console.log(JSON.stringify(result, null, 2))
  if (result.failures.length > 0) {
    throw new Error(`Ghee Roast browser verification failed with ${result.failures.length} issue(s).`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exitCode = 1
})
