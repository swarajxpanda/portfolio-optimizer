import Button from "../../components/ui/Button";
import { redirectToKiteLogin } from "../../services/authService";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dashboard px-6 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_70%_10%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(135deg,rgba(2,6,23,1),rgba(15,23,42,0.95))]" />
      <section className="relative max-w-xl rounded-[2rem] border border-slate-800 bg-slate-950/72 p-8 shadow-2xl shadow-black/35 backdrop-blur-xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200">
          Secure Broker Session
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-50">
          Portfolio intelligence needs a live Kite connection.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Authenticate with Zerodha Kite to load holdings, historical prices, allocation risk, exit signals, and fragility diagnostics.
        </p>
        <Button className="mt-7" onClick={redirectToKiteLogin} variant="primary">
          Login with Kite
        </Button>
      </section>
    </main>
  );
}
