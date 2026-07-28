import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupInfo, setShowSignupInfo] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log("Login result:", result);

      if (result.success) {
        if (result.requiresMFA && result.mfaData) {
          console.log(
            "MFA required, redirecting to MFA verification with data:",
            result.mfaData
          );
          // Redirect to MFA verification page
          navigate("/mfa-verification", {
            state: {
              mfaData: result.mfaData,
              email: formData.email,
            },
          });
        } else {
          console.log("Login successful, redirecting to dashboard");
          // Login successful, redirect will happen automatically via useEffect
          const from = (location.state as any)?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        }
      } else {
        console.log("Login failed:", result.message);
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Left Panel - Brand + value */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-14 py-14 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#0f172a_0%,#111827_38%,#0b2530_100%)]" />

        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Enviraan Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-white text-2xl font-bold tracking-tight">
              Enviraan
            </span>
          </div>
          <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-9">
            <p className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-emerald-300">
              CATENA-X &amp; PACT-READY PCF PLATFORM
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.08] text-white">
              Product carbon footprints your customers can actually trust.
            </h1>
            <p className="mt-5 text-slate-300 text-lg leading-relaxed">
              Enviraan calculates PCFs from your bill of materials, scores their data quality, and publishes them as Catena-X digital twins your supply chain can request directly.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-3">
              {[
                { value: "Catena-X", label: "PCF v9.0" },
                { value: "PACT", label: "WBCSD Aligned" },
                { value: "ISO", label: "14067 Ready" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <p className="text-emerald-300 text-lg font-semibold">{stat.value}</p>
                  <p className="text-slate-300 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
        <p className="relative z-10 text-slate-400 text-sm">
          Built for audit-ready product carbon intelligence.
        </p>
      </div>

      {/* Right Panel - Login card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.45)]">
          <div className="text-center mb-9">
            <div className="lg:hidden mb-6 flex justify-center">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Enviraan Logo"
                  className="h-9 w-9 object-contain"
                />
                <span className="text-slate-900 text-xl font-bold tracking-tight">
                  Enviraan
                </span>
              </div>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-emerald-600 mb-2">Welcome back</p>
            <h2 className="text-[40px] leading-none font-bold text-slate-900 mb-3">Sign In</h2>
            <p className="text-slate-500 text-sm">
              Manage your carbon, product &amp; compliance data
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg placeholder-slate-400 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg placeholder-slate-400 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-sm"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="border-white" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignupInfo(true)}
                className="font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Sign up
              </button>
            </p>
            {showSignupInfo && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">
                  Please reach out to the Enviraan team for access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
