'use client';
import ContentForm, { type FormConfig } from '@/app/admin/_components/ContentForm';
import { API } from '@/lib/api-paths';

const PAGE_CONFIG: FormConfig = {
  label:              'Page',
  formId:             'page-form',
  apiBase:            API.pages,
  listPath:           '/admin/pages',
  contentType:        'page',
  primaryField:       { key: 'title', label: 'Title', placeholder: 'Page title' },
  contentField:       { key: 'content', label: 'Content', placeholder: 'Write your content here (Markdown supported)…', rows: 14 },
  claudePromptPrefix: 'Write content for a page titled:',
  publishedHelp:      'Make this page visible on the public site',
};

export default function PageForm({ id }: { id?: string }) {
  return <ContentForm id={id} config={PAGE_CONFIG} />;
}
