/** Provenance-aware social knowledge; pure and deterministic. */
export type FactId = 'thomas-wednesday' | 'thomas-support' | 'iris-letter' | 'letter-undelivered';
export type PersonId = 'player' | 'miller' | 'anna' | 'thomas' | 'nora' | 'iris' | 'leo' | 'mara' | 'eleanor';
export type Claim = 'met-nora' | 'having-affair' | 'support-meeting' | 'letter-exists' | 'letter-delivered' | 'letter-lost';
export type EvidenceKind = 'firsthand' | 'hearsay' | 'admission' | 'document';

export interface Report {
  readonly id: string;
  readonly factId: FactId;
  readonly claim: Claim;
  readonly source: PersonId;
  readonly listener: PersonId;
  readonly kind: EvidenceKind;
  readonly day: number;
  readonly parentId?: string;
}
export interface World {
  readonly day: number;
  readonly reports: readonly Report[];
  readonly consent: readonly { owner: PersonId; recipient: PersonId; factId: FactId }[];
}
export const initialWorld = (): World => ({
  day: 1,
  reports: [
    { id: 'miller-sighting', factId: 'thomas-wednesday', claim: 'met-nora', source: 'miller', listener: 'miller', kind: 'firsthand', day: 1 },
    { id: 'thomas-private', factId: 'thomas-support', claim: 'support-meeting', source: 'thomas', listener: 'thomas', kind: 'firsthand', day: 1 },
    { id: 'nora-private', factId: 'thomas-support', claim: 'support-meeting', source: 'nora', listener: 'nora', kind: 'firsthand', day: 1 },
    { id: 'iris-private', factId: 'iris-letter', claim: 'letter-exists', source: 'iris', listener: 'iris', kind: 'firsthand', day: 1 },
    { id: 'eleanor-box', factId: 'letter-undelivered', claim: 'letter-lost', source: 'eleanor', listener: 'eleanor', kind: 'firsthand', day: 1 },
  ],
  consent: [],
});
export const knows = (world: World, person: PersonId, claim: Claim): boolean =>
  world.reports.some((r) => r.listener === person && r.claim === claim);
export const heard = (world: World, person: PersonId): readonly Report[] =>
  world.reports.filter((r) => r.listener === person);

export function share(world: World, reportId: string, speaker: PersonId, recipient: PersonId): World {
  const original = world.reports.find((r) => r.id === reportId && r.listener === speaker);
  if (!original) throw new Error('Speaker has not received the source report');
  const id = `${reportId}:${speaker}:${recipient}:${world.day}`;
  if (world.reports.some((r) => r.id === id)) return world;
  const next: Report = {
    id, factId: original.factId, claim: original.claim, source: speaker,
    listener: recipient, kind: 'hearsay', day: world.day, parentId: original.id,
  };
  return { ...world, reports: [...world.reports, next] };
}
export function observe(
  world: World,
  report: Omit<Report, 'kind' | 'parentId'> & { kind: 'firsthand' | 'document' | 'admission' },
): World {
  if (world.reports.some((r) => r.id === report.id)) throw new Error('Duplicate report ID');
  return { ...world, reports: [...world.reports, report] };
}
export function grantConsent(world: World, owner: PersonId, recipient: PersonId, factId: FactId): World {
  if (world.consent.some((c) => c.owner === owner && c.recipient === recipient && c.factId === factId)) return world;
  return { ...world, consent: [...world.consent, { owner, recipient, factId }] };
}
export function deliverPrivateLetter(world: World, from: PersonId, to: PersonId): World {
  if (!world.consent.some((c) => c.owner === 'iris' && c.recipient === to && c.factId === 'iris-letter')) {
    throw new Error('The letter belongs to Iris; request her consent');
  }
  const original = world.reports.find((r) => r.listener === from && r.claim === 'letter-exists');
  if (!original) throw new Error('The sender does not know about the letter');
  return share(world, original.id, from, to);
}
/** Direct evidence and hearsay remain distinct, even when many people repeat a claim. */
export function evidenceLevel(world: World, person: PersonId, claim: Claim): 'unknown' | 'rumor' | 'direct' {
  const reports = world.reports.filter((r) => r.listener === person && r.claim === claim);
  if (reports.some((r) => r.kind !== 'hearsay')) return 'direct';
  return reports.length ? 'rumor' : 'unknown';
}
