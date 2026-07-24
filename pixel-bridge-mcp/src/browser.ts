import fs from "node:fs";
import path from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright";
import { config } from "./config.js";
import { getLogger } from "./logger.js";

const log = getLogger("browser");

/**
 * One persistent Chromium profile per provider. The profile directory keeps
 * cookies/local storage between runs, so the user logs in manually once and
 * the session is reused. No credentials are ever handled by this code.
 *
 * All work for a given provider is serialized through a per-provider queue so
 * two jobs never fight over the same browser window.
 */
class BrowserManager {
  private contexts = new Map<string, BrowserContext>();
  private queues = new Map<string, Promise<unknown>>();

  async getContext(provider: string): Promise<BrowserContext> {
    const existing = this.contexts.get(provider);
    if (existing) {
      try {
        // A closed context throws on pages(); relaunch in that case.
        existing.pages();
        return existing;
      } catch {
        this.contexts.delete(provider);
      }
    }

    const profileDir = path.join(config.profilesDir, provider);
    fs.mkdirSync(profileDir, { recursive: true });
    log.info(
      `Launching persistent context for ${provider} (profile: ${profileDir}, headless: ${config.headless})`
    );
    // Chromium does not reliably honor proxy env vars on its own; forward
    // them explicitly so corporate/sandbox proxies work.
    const proxyServer = process.env.HTTPS_PROXY ?? process.env.https_proxy;
    const context = await chromium.launchPersistentContext(profileDir, {
      headless: config.headless,
      channel: config.browserChannel,
      executablePath: config.executablePath,
      viewport: { width: 1440, height: 900 },
      acceptDownloads: true,
      proxy: proxyServer ? { server: proxyServer } : undefined,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    context.setDefaultTimeout(20_000);
    context.on("close", () => {
      this.contexts.delete(provider);
      log.info(`Context for ${provider} closed`);
    });
    this.contexts.set(provider, context);
    return context;
  }

  /** Get (or create) a page in the provider's context. */
  async getPage(provider: string): Promise<Page> {
    const context = await this.getContext(provider);
    const page = context.pages()[0] ?? (await context.newPage());
    return page;
  }

  /**
   * Run `fn` exclusively for this provider — calls queue up behind each other
   * so concurrent tool calls can't interleave keystrokes in one window.
   * Different providers still run in parallel.
   */
  async withProvider<T>(provider: string, fn: (page: Page) => Promise<T>): Promise<T> {
    const prev = this.queues.get(provider) ?? Promise.resolve();
    const run = prev
      .catch(() => undefined) // one failed job must not poison the queue
      .then(async () => {
        const page = await this.getPage(provider);
        return fn(page);
      });
    this.queues.set(provider, run);
    return run;
  }

  async closeAll(): Promise<void> {
    for (const [name, ctx] of this.contexts) {
      try {
        await ctx.close();
      } catch (err) {
        log.warn(`Error closing context ${name}: ${String(err)}`);
      }
    }
    this.contexts.clear();
  }
}

export const browserManager = new BrowserManager();
