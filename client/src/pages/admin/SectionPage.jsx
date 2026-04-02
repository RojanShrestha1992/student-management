const SectionPage = ({ title, description }) => {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Admin Workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </section>
  );
};

export default SectionPage;
