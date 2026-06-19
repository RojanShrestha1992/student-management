import { Link } from "react-router-dom";
import LottieHero from "../components/LottieHero";

const FrontPage = () => {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-300 to-emerald-200 opacity-40 blur-3xl animate-hue"></div>
        <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-gradient-to-tr from-rose-300 to-pink-300 opacity-30 blur-3xl animate-float"></div>

        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <h1 className="bg-gradient-to-r from-blue-600 via-emerald-500 to-pink-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl animate-fade-up stagger-1">
                Student Management
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-xl leading-relaxed animate-fade-up stagger-2">
                Modern, fast and secure school management — tailored dashboards
                for admins, teachers and students. Organized workflows so you
                can focus on teaching, not paperwork.
              </p>

              <div className="mt-8 flex justify-center gap-4 lg:justify-start">
                <Link to="/login" className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105">
                  Get Started
                  <span className="ml-1 inline-block transform transition-transform group-hover:translate-x-1">→</span>
                </Link>

                <Link to="/register" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50">
                  Create Account
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center gap-6 lg:justify-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 p-2 glass-card animate-float"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Role-based</p>
                    <p className="text-xs text-slate-500">Secure access for everyone</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 p-2 glass-card animate-float"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Fast UI</p>
                    <p className="text-xs text-slate-500">Responsive, lightweight components</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl glass-card animate-fade-up stagger-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Live Preview</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">Admin Dashboard</h3>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400"></div>
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <div className="mock-device" aria-hidden>
                    <div className="mock-screen mock-screen--1">
                      <LottieHero src="https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json" />
                    </div>
                    <div className="mock-screen mock-screen--2">
                      <LottieHero src="https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json" />
                    </div>
                    <div className="mock-screen mock-screen--3">
                      <LottieHero src="https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json" />
                    </div>
                  </div>
                </div>
              </div>

              <svg className="absolute -right-12 -top-12 h-56 w-56 opacity-30 animate-hue" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2f74ff" />
                    <stop offset="100%" stopColor="#10a37f" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="url(#g1)" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FrontPage;
