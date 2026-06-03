// Bagian katalog teks aksesibel — seluruh 23 scene dengan artefak dalam format
// <details>/<summary> yang dapat dioperasikan keyboard dan screen reader.
import { BookOpen, Sparkles } from 'lucide-react';
import type { Museum } from '../data/museums';
import type { Artifact } from '../data/artifacts';

interface CatalogSectionProps {
  museums: Museum[];
  artifactsByScene: Record<string, Artifact[]>;
  onArtifactSelect: (artifact: Artifact) => void;
}

const categoryOrder = ['Gerbang Masuk', 'Orientasi Rute', 'Jalur Galeri', 'Galeri Atas'] as const;

export default function CatalogSection({ museums, artifactsByScene, onArtifactSelect }: CatalogSectionProps) {
  const grouped = museums.reduce<Record<string, Museum[]>>((acc, scene) => {
    const list = acc[scene.category] ?? [];
    list.push(scene);
    acc[scene.category] = list;
    return acc;
  }, {});

  return (
    <section id="katalog" className="catalog-section section-pad">
      <div className="section-heading editorial-heading">
        <p className="eyebrow">
          <span /> Katalog Aksesibilitas
        </p>
        <h2>
          Jelajahi <span className="brush">Semua Koleksi</span> dalam Teks
        </h2>
        <p>
          Seluruh 23 titik panorama dan artefaknya tersedia dalam format teks.
          Cocok untuk pembaca layar atau navigasi cepat tanpa memuat viewer 360°.
        </p>
      </div>

      <div className="catalog-body">
        {categoryOrder.map((cat) => {
          const list = grouped[cat] ?? [];
          if (list.length === 0) return null;
          return (
            <div className="catalog-category" key={cat}>
              <h3 className="catalog-category-title">
                <BookOpen size={18} aria-hidden="true" />
                <span>{cat}</span>
                <span className="cat-count">{list.length}</span>
              </h3>

              {list.map((scene) => {
                const sceneArtifacts = artifactsByScene[scene.id] ?? [];
                return (
                  <details className="catalog-scene" key={scene.id}>
                    <summary className="catalog-scene-summary">
                      <span className="catalog-scene-num">
                        {String(museums.findIndex((m) => m.id === scene.id) + 1).padStart(2, '0')}
                      </span>
                      <span className="catalog-scene-name">{scene.highlight}</span>
                      {sceneArtifacts.length > 0 && (
                        <span className="catalog-artifact-badge" aria-label={`${sceneArtifacts.length} artefak`}>
                          <Sparkles size={12} aria-hidden="true" />
                          {sceneArtifacts.length}
                        </span>
                      )}
                    </summary>
                    <div className="catalog-scene-body">
                      <p className="catalog-scene-desc">{scene.description}</p>
                      {sceneArtifacts.length > 0 ? (
                        <ul className="catalog-artifact-list" aria-label={`Artefak di ${scene.highlight}`}>
                          {sceneArtifacts.map((artifact) => (
                            <li key={artifact.id}>
                              <button
                                type="button"
                                className="catalog-artifact-button"
                                onClick={() => onArtifactSelect(artifact)}
                                aria-label={`Buka detail artefak ${artifact.name}`}
                              >
                                <Sparkles size={12} aria-hidden="true" />
                                <span>{artifact.name}</span>
                                {artifact.voiceover ? (
                                  <span className="catalog-voiceover-indicator" aria-label="Voiceover tersedia">
                                    ▶
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="catalog-no-artifact">Tidak ada artefak di titik ini.</p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
