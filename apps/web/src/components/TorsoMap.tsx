import type { LesionAnnotation } from "@dotplot/shared";

type Props = {
  lesions: LesionAnnotation[];
  activeId?: string;
  onSelect: (lesion: LesionAnnotation) => void;
};

export function TorsoMap({ lesions, activeId, onSelect }: Props) {
  return (
    <svg className="torso" viewBox="0 0 360 520" role="img" aria-label="Breast lesion torso diagram">
      <path
        d="M151 28 C105 42 78 77 70 123 L53 231 C47 272 57 330 88 388 L118 468 C126 491 145 506 180 506 C215 506 234 491 242 468 L272 388 C303 330 313 272 307 231 L290 123 C282 77 255 42 209 28 C198 52 192 79 180 105 C168 79 162 52 151 28 Z"
        fill="#f4d2c8"
        stroke="#a87368"
        strokeWidth="4"
      />
      <circle cx="133" cy="227" r="58" fill="#efd0c5" stroke="#b88379" strokeWidth="3" />
      <circle cx="227" cy="227" r="58" fill="#efd0c5" stroke="#b88379" strokeWidth="3" />
      <line x1="180" y1="96" x2="180" y2="476" stroke="#b88379" strokeWidth="2" strokeDasharray="7 8" />
      <text x="92" y="160">Left</text>
      <text x="223" y="160">Right</text>
      {lesions.map((lesion) => (
        <g
          key={lesion.id}
          className={`lesion-dot ${lesion.id === activeId ? "active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(lesion)}
          onMouseEnter={() => onSelect(lesion)}
        >
          <circle cx={lesion.torsoX} cy={lesion.torsoY} r="13" />
          <text x={lesion.torsoX + 18} y={lesion.torsoY + 5}>
            {lesion.birads.replace("BI-RADS ", "B")}
          </text>
        </g>
      ))}
    </svg>
  );
}
