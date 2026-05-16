import StatusBadge from "../../../components/ui/StatusBadge";

const ACTION_TONES = {
  EXIT: "danger",
  TRIM: "warning",
  WATCH: "warning",
  HOLD: "positive",
};

export default function ExitActionBadge({ action }) {
  return <StatusBadge tone={ACTION_TONES[action] || "neutral"}>{action || "Hold"}</StatusBadge>;
}
