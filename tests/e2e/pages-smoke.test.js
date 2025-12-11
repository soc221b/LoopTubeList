const fetch = global.fetch || require('node-fetch');

(async () => {
  const pagesUrl = process.env.PAGES_URL;
  if (!pagesUrl) {
    console.error('PAGES_URL not set');
    process.exit(2);
  }
  console.log(`Checking ${pagesUrl}`);
  try {
    const res = await fetch(pagesUrl, { method: 'GET' });
    console.log('Status:', res.status);
    if (res.status !== 200) {
      console.error('Non-200 response');
      process.exit(1);
    }
    const body = await res.text();
    if (!body || body.length === 0) {
      console.error('Empty body');
      process.exit(1);
    }
    console.log('Smoke test passed');
    process.exit(0);
  } catch (err) {
    console.error('Fetch error', err);
    process.exit(1);
  }
})();
