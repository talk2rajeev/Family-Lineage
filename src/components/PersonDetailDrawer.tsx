'use client';

import { useEffect } from 'react';
import { X, Heart, Skull } from 'lucide-react';
import type { FamilyNode as FamilyNodeData, FamilyPartner } from '@/types/family';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarClasses(gender: FamilyNodeData['gender'], isDeceased: boolean) {
  if (isDeceased) {
    return 'bg-slate-100 border-slate-300 text-slate-500';
  }
  if (gender === 'F') {
    return 'bg-pink-100 border-pink-300 text-pink-700';
  }
  if (gender === 'M') {
    return 'bg-indigo-100 border-indigo-300 text-indigo-700';
  }
  return 'bg-emerald-100 border-emerald-300 text-emerald-700';
}

function renderYears(birthYear?: number, deathYear?: number) {
  if (birthYear && deathYear) {
    return `${birthYear}–${deathYear}`;
  }
  if (birthYear) {
    return `b. ${birthYear}`;
  }
  return null;
}

function PartnerBlock({ spouse }: { spouse: FamilyPartner }) {
  const spouseIsDeceased = Boolean(spouse.deathYear);
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-4">
      <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
        <Heart className="h-3 w-3" fill="currentColor" />
        Married to
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] text-sm font-bold
            ${getAvatarClasses(spouse.gender, spouseIsDeceased)}
          `}
        >
          {spouse.photoUrl ? (
            <img src={spouse.photoUrl} alt={spouse.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            getInitials(spouse.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate font-semibold ${spouseIsDeceased ? 'text-slate-500' : 'text-slate-800'}`}>
            {spouse.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {renderYears(spouse.birthYear, spouse.deathYear)}
            {spouse.role && <span className="text-xs font-semibold uppercase tracking-tight text-amber-700">{spouse.role}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  person: FamilyNodeData | null;
  onClose: () => void;
  resolveName?: (id: string) => string | undefined;
}

export default function PersonDetailDrawer({ person, onClose, resolveName }: Props) {
  const open = person !== null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden={!open}
        className={`
          fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-drawer-title"
        className={`
          fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="person-drawer-title" className="text-lg font-semibold text-slate-900">
            Person
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {!person ? (
            <p className="text-sm text-slate-500">Select someone on the tree.</p>
          ) : (
            <div className="space-y-6">
              <div
                className={`
                  relative overflow-hidden rounded-2xl border-[1.5px] p-5 shadow-sm
                  ${person.deathYear
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-indigo-200 bg-white shadow-indigo-100/50'
                  }
                `}
              >
                {person.deathYear && (
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 shadow-sm">
                    <Skull className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`
                      flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] text-lg font-bold
                      ${getAvatarClasses(person.gender, Boolean(person.deathYear))}
                    `}
                  >
                    {person.photoUrl ? (
                      <img src={person.photoUrl} alt={person.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(person.name)
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className={`text-xl font-semibold leading-tight ${person.deathYear ? 'text-slate-600' : 'text-slate-900'}`}>
                      {person.name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      {renderYears(person.birthYear, person.deathYear)}
                      {person.role && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                          {person.role}
                        </span>
                      )}
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm">
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-slate-400">Gender</dt>
                        <dd className="font-medium text-slate-700">
                          {person.gender === 'M' ? 'Male' : person.gender === 'F' ? 'Female' : 'Other'}
                        </dd>
                      </div>
                      {person.isSpouse && person.spouseOf && (
                        <div className="flex gap-2">
                          <dt className="w-20 shrink-0 text-slate-400">Spouse of</dt>
                          <dd className="font-medium text-slate-700">
                            {resolveName?.(person.spouseOf) ?? person.spouseOf}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>

              {person.spouse && <PartnerBlock spouse={person.spouse} />}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
