'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SortableItem { id: number }

interface Props<T extends SortableItem> {
  initialItems: T[];
  reorderUrl: string;
  headers: React.ReactNode;
  renderRow: (item: T, isDragging: boolean) => React.ReactNode;
  emptyCell: React.ReactNode;
  colSpan: number;
}

export default function SortableList<T extends SortableItem>({
  initialItems, reorderUrl, headers, renderRow, emptyCell, colSpan,
}: Props<T>) {
  const [items, setItems] = useState(initialItems);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const router = useRouter();

  function getIndexFromY(clientY: number): number {
    if (!tbodyRef.current) return 0;
    const rows = Array.from(tbodyRef.current.querySelectorAll('tr'));
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return rows.length - 1;
  }

  function onPointerDown(e: React.PointerEvent<HTMLSpanElement>, id: number) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingId(id);
    setOverIndex(items.findIndex(p => p.id === id));
  }

  function onPointerMove(e: React.PointerEvent<HTMLSpanElement>, id: number) {
    if (draggingId !== id) return;
    setOverIndex(getIndexFromY(e.clientY));
  }

  async function onPointerUp(e: React.PointerEvent<HTMLSpanElement>, id: number) {
    if (draggingId !== id || overIndex === null) return;
    const fromIdx = items.findIndex(p => p.id === id);
    setDraggingId(null);
    setOverIndex(null);
    if (fromIdx === overIndex) return;

    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(overIndex, 0, moved);
    setItems(reordered);

    setSaving(true);
    await fetch(reorderUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(p => p.id) }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {saving && <p className="text-xs text-gray-400 dark:text-zinc-500 px-4 py-2 border-b border-gray-200 dark:border-zinc-800">Saving order…</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-zinc-800">
            <th className="px-4 py-3 w-8"></th>
            {headers}
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {items.map((item, idx) => {
            const isDragging = draggingId === item.id;
            const showLine = draggingId !== null && !isDragging && overIndex === idx;
            return (
              <tr
                key={item.id}
                style={showLine ? { boxShadow: 'inset 0 2px 0 rgb(99 102 241)' } : undefined}
                className={`border-b border-gray-200 dark:border-zinc-800 last:border-0 transition-colors
                  ${isDragging ? 'opacity-40 bg-gray-100 dark:bg-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
              >
                <td className="px-4 py-3">
                  <span
                    onPointerDown={e => onPointerDown(e, item.id)}
                    onPointerMove={e => onPointerMove(e, item.id)}
                    onPointerUp={e => onPointerUp(e, item.id)}
                    className="text-gray-300 hover:text-gray-500 dark:text-zinc-600 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing select-none block"
                    style={{ touchAction: 'none' }}
                  >
                    ⠿
                  </span>
                </td>
                {renderRow(item, isDragging)}
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={colSpan + 1} className="px-4 py-12 text-center text-gray-400 dark:text-zinc-600">{emptyCell}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
