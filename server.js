import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import prerender from 'prerender-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distPath = path.resolve(__dirname, 'dist');

const prerenderToken =
  process.env.PRERENDER_TOKEN || 'd3C3mB9q2DF8lNFahUlu';
prerender.set('prerenderToken', prerenderToken);

const prerenderServiceUrl = process.env.PRERENDER_SERVICE_URL;
if (prerenderServiceUrl) {
  prerender.set('prerenderServiceUrl', prerenderServiceUrl);
}

const prerenderHost =
  process.env.PRERENDER_HOST || 'https://vansunstudio.com';
prerender.set('host', prerenderHost);

const prerenderWhitelist = process.env.PRERENDER_WHITELIST;
if (prerenderWhitelist) {
  const patterns = prerenderWhitelist.split(',').map((pattern) => pattern.trim());
  prerender.whitelisted(patterns);
}

const prerenderBlacklist = process.env.PRERENDER_BLACKLIST;
if (prerenderBlacklist) {
  const patterns = prerenderBlacklist.split(',').map((pattern) => pattern.trim());
  prerender.blacklisted(patterns);
}

prerender.set('protocol', process.env.PRERENDER_PROTOCOL || 'https');

app.use(prerender);

app.use(express.static(distPath, {
  setHeaders(res, assetPath) {
    if (assetPath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Prerender proxy server listening on port ${port}`);
});

