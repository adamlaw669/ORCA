import type { Heatmap } from '@/lib/types';

const ALL_BANDS = ['LOW', 'MID', 'HIGH', 'PREMIUM'];

export default function HeatmapView({ data }: { data: Heatmap }) {
  const regions = data.regions;
  const cells = new Map<string, (typeof data.cells)[number]>();
  data.cells.forEach((c) => cells.set(`${c.region}__${c.arpu_band}`, c));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="bg-transparent text-left font-data text-[10px] font-semibold uppercase tracking-label text-ink-3" />
            {ALL_BANDS.map((b) => (
              <th
                key={b}
                className="px-3 py-2 text-left font-data text-[10px] font-semibold uppercase tracking-label text-ink-3"
              >
                {b} ARPU
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region}>
              <th
                scope="row"
                className="bg-canvas-sunken px-3 py-2 text-left text-[12px] font-medium text-ink-1 rounded-sm"
              >
                {region}
              </th>
              {ALL_BANDS.map((band) => {
                const cell = cells.get(`${region}__${band}`);
                if (!cell) {
                  return (
                    <td
                      key={band}
                      className="rounded-sm bg-canvas-sunken/40 px-3 py-2 text-center font-data text-[11px] text-ink-3"
                    >
                      —
                    </td>
                  );
                }
                const risk = cell.avg_risk;
                const bg = riskColor(risk);
                const textColor = riskTextColor(risk);
                return (
                  <td
                    key={band}
                    className="rounded-sm px-3 py-2 text-center transition-shadow hover:shadow-[0_0_0_1px_rgba(250,204,21,0.4)]"
                    style={{ background: bg, color: textColor }}
                    title={`${cell.customers} customer(s) · avg risk ${cell.avg_risk} · ${cell.critical_count} critical`}
                  >
                    <div className="font-data text-[14px] font-semibold tabular-nums">{cell.avg_risk}</div>
                    <div className="font-data text-[10px] uppercase tracking-label opacity-75">
                      {cell.customers}c{cell.critical_count > 0 ? ` · ${cell.critical_count}!` : ''}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center gap-3 font-data text-[10px] uppercase tracking-label text-ink-3">
        <span>SCALE</span>
        {[10, 30, 50, 70, 90].map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-6 rounded-sm ring-1 ring-chrome-1"
              style={{ background: riskColor(v) }}
            />
            <span style={{ color: '#A3A3A3' }}>{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Dark-friendly heat scale: deep green → yellow → orange → red.
function riskColor(score: number): string {
  if (score < 1) return '#1C1C1C';
  if (score < 25) return '#0E2A1A'; // deep green
  if (score < 45) return '#14532D'; // green-900
  if (score < 60) return '#854D0E'; // amber-800
  if (score < 75) return '#CA8A04'; // yellow-deep
  if (score < 88) return '#FACC15'; // accent yellow
  return '#EF4444'; // critical red
}

function riskTextColor(score: number): string {
  // Yellow & red bands need dark text; green bands need light text.
  if (score >= 60 && score < 88) return '#0A0A0A';
  if (score >= 88) return '#FFFFFF';
  return '#FAFAFA';
}
