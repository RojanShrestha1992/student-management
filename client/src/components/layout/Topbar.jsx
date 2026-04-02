const Topbar = ({ user, onLogout }) => {
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
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Role
            </p>
            <p className="text-sm font-semibold capitalize text-slate-900">
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
