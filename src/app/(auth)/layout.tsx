export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Quick<span className="text-brand-500">Apps</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            Your Website. Native App. In 15 Minutes.
          </p>
        </div>
        <div className="rounded-xl p-6 shadow-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
