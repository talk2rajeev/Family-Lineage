'use client';

import { usePathname, useRouter } from 'next/navigation';

const LAYOUT_CLEAN = '/clean-static';
const LAYOUT_DYNAMIC = '/dynamic';

export default function TreeLayoutControl() {
  const pathname = usePathname();
  const router = useRouter();
  const selectValue = pathname.startsWith(LAYOUT_CLEAN) ? LAYOUT_CLEAN : LAYOUT_DYNAMIC;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <label htmlFor="family-tree-layout" className="text-right text-sm font-semibold text-slate-600">
        Family Tree layout
      </label>
      <select
        id="family-tree-layout"
        value={selectValue}
        onChange={(e) => router.push(e.target.value)}
        className="w-[min(220px,calc(100vw-2rem))] cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        <option value={LAYOUT_CLEAN}>Clean Static design</option>
        <option value={LAYOUT_DYNAMIC}>Dynamic design</option>
      </select>
    </div>
  );
}
