// This fixture owns the entire QA CLI process and its browser server.
// Keep cleanup bounded, while allowing any original assertion to escape finally.
export async function launchQaBrowser(chromium, { shutdownMs = 5000, exitGraceMs = 1000 } = {}) {
  const server = await chromium.launchServer({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  const browser = await chromium.connect(server.wsEndpoint());
  return {
    browser,
    async close() {
      let timer;
      const graceful = (async () => {
        await browser.close();
        await server.close();
      })();
      try {
        await Promise.race([
          graceful,
          new Promise((resolve) => {
            timer = setTimeout(() => {
              console.warn(
                'Browser shutdown exceeded its budget; terminating this runner’s owned fixture.',
              );
              // Some hosts never resolve kill()/close() after the process died.
              void server
                .kill()
                .catch((error) => console.warn('Owned browser cleanup:', error.message));
              resolve();
              // Return from finally first. An assertion/rejection then exits with 1;
              // only an otherwise-finished CLI with stale transport handles reaches this.
              setTimeout(() => process.exit(process.exitCode ?? 0), exitGraceMs).unref();
            }, shutdownMs);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
