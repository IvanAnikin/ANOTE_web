/** Product disclaimer shown on every /obory and /clanky page (ANOTE_legal.md §2.2 wording). */
export function RegulatoryDisclaimer() {
  return (
    <aside className="mx-auto max-w-3xl px-6 pb-12">
      <p className="rounded-xl border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-text-secondary">
        ANOTE je softwarový nástroj pro přepis, strukturování a přípravu návrhu zdravotnické
        dokumentace na základě rozhovoru lékaře s pacientem nebo diktátu lékaře. Výstup je pouze
        návrhem a před jakýmkoli klinickým použitím jej musí zkontrolovat, upravit a schválit
        kvalifikovaný zdravotnický pracovník.
      </p>
    </aside>
  );
}
