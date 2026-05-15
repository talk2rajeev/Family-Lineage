'use client';

export default function Legend() {
  return (
    <div className="flex max-w-[min(100%,calc(100vw-240px))] items-center gap-4 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-md">
        {/* Node types */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-indigo-100 border-[1.5px] border-indigo-400 flex-shrink-0" />
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Blood relative</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-pink-100 border-[1.5px] border-pink-400 flex-shrink-0" />
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Female</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-amber-100 border-[1.5px] border-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Husband / Wife / In-law</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-slate-100 border-[1.5px] border-slate-300 flex-shrink-0" />
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Deceased</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        {/* Edge types */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 border-t-[2px] border-indigo-400 flex-shrink-0" />
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Parent–child</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-7 border-t-[2px] border-dashed border-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Marriage link</span>
        </div>
      </div>
  );
}
