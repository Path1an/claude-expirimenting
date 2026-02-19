import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  return new Anthropic({ apiKey });
}

export async function generateContent(
  prompt: string,
  context: 'page' | 'product' | 'post'
): Promise<string> {
  const systemMap = {
    product: 'You are an expert e-commerce copywriter. Write compelling, conversion-focused product descriptions in Markdown. Return only the description text.',
    post:    'You are an expert blog writer. Write engaging, informative blog post content in Markdown. Return only the post body.',
    page:    'You are an expert marketing copywriter. Write engaging, SEO-friendly page copy in Markdown. Return only the copy.',
  };

  const client = getClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemMap[context],
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response from Claude');
  return block.text;
}

export async function generateSEO(
  content: string,
  contentType: 'page' | 'product' | 'post'
): Promise<{ metaTitle: string; metaDescription: string; keywords: string }> {
  const client = getClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are an SEO specialist. Given ${contentType} content, generate:
- metaTitle: max 60 characters, keyword-rich
- metaDescription: max 155 characters, compelling with primary keyword
- keywords: comma-separated list of 5-8 target keywords

Respond ONLY with valid JSON in exactly this shape:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": "..."
}`,
    messages: [{ role: 'user', content: `Generate SEO metadata for:\n\n${content}` }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response from Claude');
  const raw = block.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(raw);
}

export async function chat(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const client = getClient();
  const { db } = await import('@/db');
  const { pages, posts, products, media } = await import('@/db/schema');
  const { count } = await import('drizzle-orm');

  const [[pageCount], [postCount], [productCount], [mediaCount]] = await Promise.all([
    db.select({ count: count() }).from(pages),
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(media),
  ]);

  const cmsContext = `CMS live data:
- Pages: ${pageCount.count}
- Blog posts: ${postCount.count}
- Products: ${productCount.count}
- Media files: ${mediaCount.count}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are a helpful CMS assistant. You have access to real-time CMS data:\n\n${cmsContext}\n\nAnswer questions concisely and accurately.`,
    messages: [...history, { role: 'user', content: userMessage }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response from Claude');
  return block.text;
}
