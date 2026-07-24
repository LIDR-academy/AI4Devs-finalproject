import type { CubeColor, CubeCounts } from "../types/dashboard";

type Props = {
  counts: CubeCounts;
};

const colors: Array<{ key: CubeColor; label: string }> = [
  { key: "red", label: "Rojo" },
  { key: "blue", label: "Azul" },
  { key: "green", label: "Verde" },
  { key: "yellow", label: "Amarillo" }
];

export function CountsPanel({ counts }: Props) {
  return (
    <section className="panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Cubos registrados en sesion</p>
          <h2>{counts.total}</h2>
        </div>
      </div>

      <div className="count-list">
        {colors.map((color) => (
          <div className="count-row" key={color.key}>
            <span className={`swatch swatch-${color.key}`} aria-hidden="true" />
            <span>{color.label}</span>
            <strong>{counts[color.key]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
