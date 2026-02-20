const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
  POST:   'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  PUT:    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
  OPTIONS:'bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-zinc-400 border border-gray-300 dark:border-zinc-600',
};

const AUTH_COLORS: Record<string, string> = {
  Public:    'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400',
  Protected: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30',
};

interface Endpoint {
  method: string;
  path: string;
  auth: 'Public' | 'Protected';
  description: string;
  requestBody?: string;
  responseNote?: string;
}

interface Group {
  title: string;
  endpoints: Endpoint[];
}

const groups: Group[] = [
  {
    title: 'Pages',
    endpoints: [
      { method: 'GET',    path: '/api/pages',        auth: 'Public',    description: 'List all published pages' },
      { method: 'GET',    path: '/api/pages/:slug',  auth: 'Public',    description: 'Get a single page by slug' },
      { method: 'POST',   path: '/api/pages',        auth: 'Protected', description: 'Create a new page',
        requestBody: `{\n  "title": "About Us",\n  "slug": "about",\n  "content": "<p>Hello</p>",\n  "status": "published"\n}` },
      { method: 'PUT',    path: '/api/pages/:id',    auth: 'Protected', description: 'Update an existing page' },
      { method: 'DELETE', path: '/api/pages/:id',    auth: 'Protected', description: 'Delete a page' },
      { method: 'OPTIONS',path: '/api/pages',        auth: 'Public',    description: 'CORS preflight' },
    ],
  },
  {
    title: 'Blog Posts',
    endpoints: [
      { method: 'GET',    path: '/api/posts',        auth: 'Public',    description: 'List all published posts' },
      { method: 'GET',    path: '/api/posts/:slug',  auth: 'Public',    description: 'Get a single post by slug' },
      { method: 'POST',   path: '/api/posts',        auth: 'Protected', description: 'Create a new post',
        requestBody: `{\n  "title": "My Post",\n  "slug": "my-post",\n  "content": "<p>Body</p>",\n  "excerpt": "Short summary",\n  "status": "published"\n}` },
      { method: 'PUT',    path: '/api/posts/:id',    auth: 'Protected', description: 'Update a post' },
      { method: 'DELETE', path: '/api/posts/:id',    auth: 'Protected', description: 'Delete a post' },
      { method: 'OPTIONS',path: '/api/posts',        auth: 'Public',    description: 'CORS preflight' },
    ],
  },
  {
    title: 'Products',
    endpoints: [
      { method: 'GET',    path: '/api/products',       auth: 'Public',    description: 'List all products' },
      { method: 'GET',    path: '/api/products/:slug', auth: 'Public',    description: 'Get a single product by slug' },
      { method: 'POST',   path: '/api/products',       auth: 'Protected', description: 'Create a product',
        requestBody: `{\n  "name": "Widget Pro",\n  "slug": "widget-pro",\n  "description": "...",\n  "price": 29.99,\n  "currency": "USD",\n  "status": "active"\n}` },
      { method: 'PUT',    path: '/api/products/:id',   auth: 'Protected', description: 'Update a product' },
      { method: 'DELETE', path: '/api/products/:id',   auth: 'Protected', description: 'Delete a product' },
      { method: 'OPTIONS',path: '/api/products',       auth: 'Public',    description: 'CORS preflight' },
    ],
  },
  {
    title: 'Media',
    endpoints: [
      { method: 'GET',    path: '/api/media',     auth: 'Public',    description: 'List all uploaded media files' },
      { method: 'POST',   path: '/api/media',     auth: 'Protected', description: 'Upload a file (multipart/form-data)',
        requestBody: 'FormData: file (binary), alt (string)' },
      { method: 'DELETE', path: '/api/media/:id', auth: 'Protected', description: 'Delete a media file' },
      { method: 'OPTIONS',path: '/api/media',     auth: 'Public',    description: 'CORS preflight' },
    ],
  },
  {
    title: 'Site Settings',
    endpoints: [
      { method: 'GET',    path: '/api/settings', auth: 'Public',    description: 'Get site settings (name, description, logo, socials)' },
      { method: 'PUT',    path: '/api/settings', auth: 'Protected', description: 'Update site settings',
        requestBody: `{\n  "siteName": "My Site",\n  "siteDescription": "A great site",\n  "logoUrl": "https://...",\n  "socialLinks": { "twitter": "https://...", "github": "https://..." },\n  "corsOrigins": ["https://myapp.com"]\n}` },
      { method: 'OPTIONS',path: '/api/settings', auth: 'Public',    description: 'CORS preflight' },
    ],
  },
  {
    title: 'API Tokens',
    endpoints: [
      { method: 'GET',    path: '/api/tokens',     auth: 'Protected', description: 'List tokens (values masked)' },
      { method: 'POST',   path: '/api/tokens',     auth: 'Protected', description: 'Create a token — full value returned once',
        requestBody: '{ "name": "My Frontend App" }',
        responseNote: 'Returns { id, name, fullToken } — store the fullToken immediately.' },
      { method: 'DELETE', path: '/api/tokens/:id', auth: 'Protected', description: 'Revoke a token' },
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${METHOD_COLORS[method] ?? 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'}`}>
      {method}
    </span>
  );
}

function AuthBadge({ auth }: { auth: 'Public' | 'Protected' }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded ${AUTH_COLORS[auth]}`}>
      {auth === 'Protected' ? '🔑 Bearer token' : 'Public'}
    </span>
  );
}

export default function ApiReferencePage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">API Reference</h1>
        <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">All available headless API endpoints</p>
      </div>

      {/* Auth overview */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3">Authentication</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
          Protected endpoints require a Bearer token in the <code className="text-indigo-600 dark:text-indigo-300 bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">Authorization</code> header.
          Create tokens in <strong className="text-gray-800 dark:text-zinc-200">Settings → API Tokens</strong>.
        </p>
        <pre className="bg-gray-900 dark:bg-zinc-950 rounded-lg p-4 text-xs font-mono text-gray-300 dark:text-zinc-300 overflow-x-auto">{`curl https://your-cms.com/api/posts \\
  -H "Authorization: Bearer cms_your_token_here"`}</pre>
        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-3">
          Public GET endpoints and OPTIONS requests work without a token.
          CORS allowed origins are configured in <strong className="text-gray-500 dark:text-zinc-500">Settings → Site Settings</strong>.
        </p>
      </div>

      {/* Endpoint groups */}
      <div className="space-y-4">
        {groups.map(group => (
          <div key={group.title} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{group.title}</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-zinc-800">
              {group.endpoints.map((ep, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <MethodBadge method={ep.method} />
                    <code className="text-sm font-mono text-gray-800 dark:text-zinc-200">{ep.path}</code>
                    <AuthBadge auth={ep.auth} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{ep.description}</p>
                  {ep.requestBody && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 dark:text-zinc-500 cursor-pointer hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                        Request body
                      </summary>
                      <pre className="mt-2 bg-gray-900 dark:bg-zinc-950 rounded-lg p-3 text-xs font-mono text-gray-300 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                        {ep.requestBody}
                      </pre>
                    </details>
                  )}
                  {ep.responseNote && (
                    <p className="text-xs text-amber-600 dark:text-amber-400/80 mt-2">⚠ {ep.responseNote}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Base URL note */}
      <div className="mt-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3">Response format</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">All endpoints return JSON. List endpoints return an array directly. Error responses follow:</p>
        <pre className="bg-gray-900 dark:bg-zinc-950 rounded-lg p-4 text-xs font-mono text-gray-300 dark:text-zinc-300">{`{ "error": "Unauthorized" }   // 401
{ "error": "Not Found" }       // 404
{ "error": "Bad Request" }     // 400`}</pre>
      </div>
    </div>
  );
}
