import Card from "../../../components/ui/Card";
import ProgressBar from "../../../components/ui/ProgressBar";
import { formatPercent } from "../../../utils/formatters";

function groupByCluster(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    if (!groups.has(row.cluster)) groups.set(row.cluster, []);
    groups.get(row.cluster).push(row);
  });
  return groups;
}

export default function FragilityEnbPanel({ enbRows = [], gauge, summary }) {
  const fill = Math.max(0, Math.min(100, Number(gauge?.fill_pct || 0)));
  const strongestPair = summary?.strongest_pair?.symbols?.length
    ? `${summary.strongest_pair.symbols.join(" x ")} (${summary.strongest_pair.corr})`
    : "Not available";
  const groupedRows = groupByCluster(enbRows);
  const maxShare = Math.max(...enbRows.map((row) => Number(row.enb_share || 0)), 1);

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden rounded-[20px]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
          ENB Cluster Breakdown
        </div>
      </div>
      <div className="p-5">
        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-1)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">Effective Bets</div>
              <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--text-1)]">
                {gauge?.enb}
                <span className="ml-1 text-sm text-[var(--text-2)]">of {gauge?.holdings}</span>
              </div>
              <ProgressBar className="mt-3 h-2" color="var(--accent)" value={fill} />
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-1)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">Strongest Pair</div>
              <div className="mt-2 font-mono text-sm text-[var(--text-1)]">{strongestPair}</div>
              <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-3)]">
                {summary?.cluster_count || 0} clusters
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from(groupedRows.entries()).map(([clusterName, rows], clusterIndex) => (
              <section key={clusterName} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
                      Cluster {clusterIndex + 1}
                    </div>
                    <div className="mt-1 font-mono text-sm text-[var(--text-1)]">{clusterName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-[var(--accent)]">
                      {rows[0]?.cluster_enb?.toFixed?.(2) || Number(rows[0]?.cluster_enb || 0).toFixed(2)}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
                      cluster ENB
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {rows
                    .slice()
                    .sort((left, right) => Number(right.enb_share || 0) - Number(left.enb_share || 0))
                    .map((item, index) => {
                      const share = Number(item.enb_share || 0);
                      const width = Math.max(3, (share / maxShare) * 100);
                      return (
                        <div key={`${item.symbol}-${item.cluster}`} className="grid grid-cols-[24px_1fr_auto] items-center gap-3">
                          <div className="font-mono text-[10px] text-[var(--text-3)]">{index + 1}</div>
                          <div>
                            <div className="font-mono text-sm text-[var(--text-1)]">{item.symbol}</div>
                            <div className="mt-1 h-1 overflow-hidden rounded-[3px] bg-[rgba(0,212,255,0.12)]">
                              <div
                                className="h-full rounded-[3px] bg-[rgba(0,212,255,0.3)]"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-[var(--text-2)]">
                            {formatPercent(item.weight_pct)} | {share.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
