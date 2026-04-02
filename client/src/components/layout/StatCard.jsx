const StatCard = ({ label, value, hint, accent = "slate" }) => {
  const accents = {
    slate: "from-slate-900 to-slate-700",
    blue: "from-blue-600 to-cyan-500",
    emerald: "from-emerald-600 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-600 to-pink-500",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${accents[accent]}`} />
      </div>
      {hint ? <p className="mt-4 text-sm leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
};

export default StatCard;
