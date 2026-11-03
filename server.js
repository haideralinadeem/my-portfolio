import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, 'data');
const port = Number(process.env.PORT) || 3000;
const publicFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/script.js': ['script.js', 'text/javascript; charset=utf-8'],
  '/profile.jpg': ['profile.jpg', 'image/jpeg']
};

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(body));
}

async function readJson(name) {
  return JSON.parse(await readFile(join(dataDir, name), 'utf8'));
}

async function readRequestJson(req) {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 10_000) throw new Error('Message too large.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Invalid JSON.');
  }
}

// Serialize writes so simultaneous contact submissions are not lost.
let saveQueue = Promise.resolve();
function saveMessage(message) {
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    await mkdir(dataDir, { recursive: true });
    let messages;
    try {
      messages = await readJson('messages.json');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      messages = [];
    }
    messages.push(message);
    await writeFile(join(dataDir, 'messages.json'), JSON.stringify(messages, null, 2) + '\n');
  });
  return saveQueue;
}

const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;

    if (req.method === 'GET' && path === '/api/projects') {
      return json(res, 200, await readJson('projects.json'));
    }

    if (req.method === 'POST' && path === '/api/contact') {
      if (!req.headers['content-type']?.startsWith('application/json')) {
        return json(res, 415, { error: 'Send JSON content.' });
      }
      const body = await readRequestJson(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return json(res, 400, { error: 'Invalid form data.' });
      }
      const { name, email, message, website } = body;
      // Honeypot: bots filling the hidden field are silently ignored.
      if (website) return json(res, 200, { message: 'Thanks for your message!' });
      if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
        return json(res, 400, { error: 'All fields are required.' });
      }
      const cleanName = name.trim();
      const cleanEmail = email.trim();
      const cleanMessage = message.trim();
      if (!cleanName || cleanName.length > 80 || !/^\S+@\S+\.\S+$/.test(cleanEmail) || cleanEmail.length > 120 || !cleanMessage || cleanMessage.length > 2000) {
        return json(res, 400, { error: 'Please enter a valid name, email and message.' });
      }
      await saveMessage({ name: cleanName, email: cleanEmail, message: cleanMessage, createdAt: new Date().toISOString() });
      return json(res, 201, { message: 'Message saved successfully. Thank you!' });
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && Object.hasOwn(publicFiles, path)) {
      const [filename, type] = publicFiles[path];
      const content = await readFile(join(root, 'public', filename));
      res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
      return res.end(req.method === 'HEAD' ? undefined : content);
    }

    return json(res, 404, { error: 'Not found.' });
  } catch (error) {
    if (error.message === 'Invalid JSON.' || error.message === 'Message too large.') {
      return json(res, 400, { error: error.message });
    }
    console.error(error);
    return json(res, 500, { error: 'Server error. Please try again.' });
  }
});

server.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
