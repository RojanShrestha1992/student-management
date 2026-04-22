const Topbar = ({ user, onLogout }) => {
  const roleColorByUser = {
    admin: "bg-blue-100 text-blue-700 border-blue-200",
    teacher: "bg-emerald-100 text-emerald-700 border-emerald-200",
    student: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const roleBadgeClass = roleColorByUser[user?.role] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Welcome back
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {user?.name || "User"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden rounded-2xl border px-4 py-2 text-right sm:block ${roleBadgeClass}`}>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Role
            </p>
            <p className="text-sm font-semibold capitalize">
              {user?.role || "guest"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
