'use client';
import ContentForm, { type FormConfig, inputCls, labelCls } from '@/app/admin/_components/ContentForm';
import ProductImageManager from './ProductImageManager';
import { API } from '@/lib/api-paths';

const PRODUCT_CONFIG: FormConfig = {
  label:              'Product',
  formId:             'product-form',
  apiBase:            API.products,
  listPath:           '/admin/products',
  contentType:        'product',
  primaryField:       { key: 'name', label: 'Name', placeholder: 'Product name' },
  contentField:       { key: 'description', label: 'Description', placeholder: 'Product description…', rows: 12 },
  claudePromptPrefix: 'Write a product description for:',
  publishedHelp:      'Make this product visible in the store',

  extraFields: ({ extra, setExtra }) => (
    <div>
      <label className={labelCls}>Price *</label>
      <input type="number" step="0.01" min="0" value={extra.price ?? ''} onChange={e => setExtra('price', e.target.value)}
        required className={inputCls} placeholder="0.00" />
    </div>
  ),

  extraPayload: (extra) => ({
    price: parseFloat(extra.price || '0'),
  }),

  hydrateExtra: (data, setExtra) => {
    setExtra('price', String(data.price ?? ''));
  },
};

export default function ProductForm({ id }: { id?: string }) {
  return (
    <>
      <ContentForm id={id} config={PRODUCT_CONFIG} />
      {id ? (
        <ProductImageManager productId={Number(id)} />
      ) : (
        <p className="mt-4 text-xs text-zinc-600">Save the product first to add images.</p>
      )}
    </>
  );
}
