import StatusBadge from "../../../components/ui/StatusBadge";
import { formatINR } from "../../../utils/formatters";

export default function AllocationActionBadge({ action }) {
  if (action?.type === "TRIM") {
    return <StatusBadge tone="warning">Trim {formatINR(action.amount, { compact: true })}</StatusBadge>;
  }

  if (action?.type === "ADD") {
    return <StatusBadge tone="info">Add {formatINR(action.amount, { compact: true })}</StatusBadge>;
  }

  return <StatusBadge tone="neutral">Hold</StatusBadge>;
}
