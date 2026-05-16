import { TableHeader, TableRow, TableShell } from "../../../components/ui/DataTable";
import { formatINR, formatPercent, formatSignedINR } from "../../../utils/formatters";
import { getSignedTone } from "../../../utils/finance";
import AllocationActionBadge from "./AllocationActionBadge";

const GRID = "grid-cols-[1.4fr_1fr_0.8fr_1fr_0.8fr_1fr] gap-4 items-center";

export default function ConcentrationTable({ rows }) {
  return (
    <TableShell
      title="Concentration Controls"
      description="Largest exposure checks against portfolio-level concentration limits."
    >
      <TableHeader className={GRID}>
        <div>Metric</div>
        <div className="text-right">Value</div>
        <div className="text-right">Weight</div>
        <div className="text-right">P&L</div>
        <div className="text-right">Limit</div>
        <div className="text-right">Action</div>
      </TableHeader>
      {rows.map((row) => {
        const toneClass = getSignedTone(row.pnl) === "positive" ? "text-emerald-300" : "text-rose-300";

        return (
          <TableRow key={row.metric} className={GRID}>
            <div className="font-semibold text-slate-100">{row.metric}</div>
            <div className="text-right font-mono tabular-nums">{formatINR(row.value)}</div>
            <div className="text-right font-mono tabular-nums">{formatPercent(row.value_pct)}</div>
            <div className={`text-right font-mono tabular-nums ${toneClass}`}>{formatSignedINR(row.pnl)}</div>
            <div className="text-right font-mono text-slate-400">{row.limit}</div>
            <div className="text-right">
              <AllocationActionBadge action={row.action} />
            </div>
          </TableRow>
        );
      })}
    </TableShell>
  );
}
