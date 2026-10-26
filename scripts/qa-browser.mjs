// Each runner owns its browser server. Bound shutdown without hiding test failures.
export async function launchQaBrowser(chromium) {
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
          new Promise((resolve, reject) => {
            timer = setTimeout(() => {
              console.warn(
                'Browser shutdown exceeded 5s; terminating this runner’s owned fixture.',
              );
              server.kill().then(resolve, reject);
            }, 5000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
