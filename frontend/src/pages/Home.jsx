import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen page-offset flex items-center justify-center">
      <section className="max-w-6xl w-full px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-4">
              The future of <span className="text-[#2563EB]">Land Tax Management</span>
            </h1>
            <p className="text-gray-600 mb-6">
              Manage properties, verify ownership, calculate taxes, and generate receipts — all in one secure and modern platform.
            </p>

            <div className="flex gap-3">
              <Link to="/login" className="btn-primary">Login to Dashboard</Link>
              <Link to="/about" className="btn-secondary">Explore Features</Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-[#2563EB]">10K+</div>
                <div className="text-gray-500">Properties managed</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-[#06b6d4]">99.9%</div>
                <div className="text-gray-500">Uptime & secure</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-[#2563EB]">1M+</div>
                <div className="text-gray-500">Records processed</div>
              </div>
            </div>
          </div>

          {/* Right: floating cards / preview */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-500">Paid / Pending</div>
                <div className="text-sm font-semibold text-[#2563EB]">Overview</div>
              </div>
              <div className="w-full h-36 bg-gradient-to-r from-blue-50 to-white rounded-lg" />
            </div>

            <div className="glass-card p-6">
              <div className="text-sm text-gray-500 mb-2">Map preview</div>
              <div className="w-full h-28 bg-gray-50 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
