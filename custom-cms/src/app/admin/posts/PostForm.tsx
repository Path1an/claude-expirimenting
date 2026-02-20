'use client';
import ContentForm, { type FormConfig, inputCls, labelCls } from '@/app/admin/_components/ContentForm';
import { API } from '@/lib/api-paths';

const POST_CONFIG: FormConfig = {
  label:              'Post',
  formId:             'post-form',
  apiBase:            API.posts,
  listPath:           '/admin/posts',
  contentType:        'post',
  primaryField:       { key: 'title', label: 'Title', placeholder: 'Post title' },
  contentField:       { key: 'content', label: 'Content', placeholder: 'Write your post here (Markdown supported)…', rows: 16 },
  claudePromptPrefix: 'Write a blog post titled:',
  publishedHelp:      'Make this post visible on the blog',

  extraFields: ({ extra, setExtra }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Author</label>
          <input value={extra.author ?? ''} onChange={e => setExtra('author', e.target.value)} className={inputCls} placeholder="Author name" />
        </div>
        <div>
          <label className={labelCls}>Tags</label>
          <input value={extra.tags ?? ''} onChange={e => setExtra('tags', e.target.value)} className={inputCls} placeholder="tech, news, guide" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Publish Date</label>
        <input type="datetime-local" value={extra.publishedAt ?? ''} onChange={e => setExtra('publishedAt', e.target.value)}
          className={inputCls + ' w-auto'} />
      </div>
    </>
  ),

  extraPayload: (extra) => ({
    author: extra.author,
    tags: extra.tags,
    publishedAt: extra.publishedAt || null,
  }),

  hydrateExtra: (data, setExtra) => {
    setExtra('author', String(data.author ?? ''));
    setExtra('tags', String(data.tags ?? ''));
    setExtra('publishedAt', data.publishedAt ? String(data.publishedAt).slice(0, 16) : '');
  },
};

export default function PostForm({ id }: { id?: string }) {
  return <ContentForm id={id} config={POST_CONFIG} />;
}
