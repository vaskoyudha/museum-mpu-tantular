import catalog from './artifacts.json';

export type Artifact = {
  id: string;
  sceneId: string;
  name: string;
  photos: string[];
  cards: string[];
  x: number;
  y: number;
  angle: number;
  description?: string;
  voiceover?: string;
};

const ARTEFAK_BASE = '/artefak/mpu-tantular/';

const xPattern = (index: number, total: number): number => {
  if (total === 1) return 50;
  if (total === 2) return [35, 65][index];
  if (total === 3) return [28, 50, 72][index];
  if (total === 4) return [22, 42, 58, 78][index];
  return 18 + (64 * index) / (total - 1);
};

const yPattern = (index: number): number => [34, 46, 30, 42, 38][index % 5];

const anglePattern = (index: number, total: number): number => {
  if (total === 1) return -10;
  return -40 + (80 * index) / Math.max(1, total - 1);
};

type RawArtifact = {
  sceneId: string;
  slug: string;
  name: string;
  photos: string[];
  cards: string[];
  description?: string;
  voiceover?: string;
};

const grouped = new Map<string, RawArtifact[]>();
for (const item of catalog as RawArtifact[]) {
  const list = grouped.get(item.sceneId) ?? [];
  list.push(item);
  grouped.set(item.sceneId, list);
}

export const artifacts: Artifact[] = (catalog as RawArtifact[]).map((item) => {
  const sceneList = grouped.get(item.sceneId) ?? [];
  const idx = sceneList.findIndex((entry) => entry.slug === item.slug);
  const total = sceneList.length;
  return {
    id: item.slug,
    sceneId: item.sceneId,
    name: item.name,
    photos: item.photos.map((p) => `${ARTEFAK_BASE}${p}`),
    cards: item.cards.map((c) => `${ARTEFAK_BASE}${c}`),
    x: xPattern(idx, total),
    y: yPattern(idx),
    angle: anglePattern(idx, total),
    description: item.description ?? '',
    voiceover: item.voiceover ?? '',
  };
});

export const artifactsByScene: Record<string, Artifact[]> = artifacts.reduce<
  Record<string, Artifact[]>
>((acc, artifact) => {
  const list = acc[artifact.sceneId] ?? [];
  list.push(artifact);
  acc[artifact.sceneId] = list;
  return acc;
}, {});

export const totalArtifacts = artifacts.length;
