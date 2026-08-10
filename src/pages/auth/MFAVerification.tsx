import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  QrCode,
  Download,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

interface MFAData {
  success: boolean;
  message: string;
  qrCode?: string;
  manualCode?: string;
  localIP?: string;
}

const MFAVerification: React.FC = () => {
  const [mfaToken, setMfaToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mfaData, setMfaData] = useState<MFAData | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [showQR, setShowQR] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState<string>("");
  const [isSetupDone, setIsSetupDone] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyMFA } = useAuth();

  useEffect(() => {
    console.log("MFA Verification - Location state:", location.state);
    // Get MFA data and email from location state
    if (location.state?.mfaData && location.state?.email) {
      console.log("MFA data received:", location.state.mfaData);
      console.log("User email:", location.state.email);
      setMfaData(location.state.mfaData);
      setUserEmail(location.state.email);

      // Determine if setup is already done. If the backend didn't send a secret, assume done.
      const setupKey = `mfaSetupDone:${location.state.email}`;
      const saved = localStorage.getItem(setupKey) === "true";
      const backendIndicatesDone = !location.state.mfaData.manualCode;
      console.log(
        "Setup status - saved:",
        saved,
        "backend indicates done:",
        backendIndicatesDone
      );
      setIsSetupDone(saved || backendIndicatesDone);
    } else {
      console.log("No MFA data found, redirecting to login");
      // If no MFA data, redirect to login
      navigate("/login");
    }
  }, [location.state, navigate]);

  // Generate QR code for Google Authenticator using otpauth URI when manual code changes
  useEffect(() => {
    if (!isSetupDone && mfaData?.manualCode && userEmail) {
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfaData?.manualCode, userEmail, isSetupDone]);

  const buildOtpAuthUri = (secret: string, email: string): string => {
    const issuer = "EnviGuide";
    // Use a simpler label format that Google Authenticator prefers
    const label = `${issuer}:${email}`;

    // Validate that the secret is base32-encoded
    const base32Regex = /^[A-Z2-7]+=*$/;
    if (!base32Regex.test(secret)) {
      console.warn("Secret may not be properly base32-encoded:", secret);
    }

    // Build the URI with proper formatting
    const uri = `otpauth://totp/${encodeURIComponent(
      label
    )}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(
      issuer
    )}&algorithm=SHA1&digits=6&period=30`;

    return uri;
  };

  const generateQRCode = async () => {
    if (!mfaData?.manualCode || !userEmail) return;
    try {
      const otpauth = buildOtpAuthUri(mfaData.manualCode, userEmail);

      // Validate the URI format
      if (!otpauth.startsWith("otpauth://totp/")) {
        console.error("Invalid otpauth URI format:", otpauth);
        return;
      }

      const qrDataURL = await QRCode.toDataURL(otpauth, {
        margin: 1, // Reduced margin for better scanning
        color: { dark: "#000000", light: "#FFFFFF" },
        errorCorrectionLevel: "H", // High error correction for better scanning
        type: "image/png",
      });

      setGeneratedQRCode(qrDataURL);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!mfaToken.trim()) {
      setError("Please enter the MFA token");
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyMFA(userEmail, mfaToken);
      console.log("MFA verification result:", result);

      if (result.success && result.user) {
        // Mark setup as done for this email so we don't show QR/manual code again
        const setupKey = `mfaSetupDone:${userEmail}`;
        localStorage.setItem(setupKey, "true");
        setIsSetupDone(true);

        setSuccess("MFA verified successfully! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        setError(
          result.message || "MFA verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (generatedQRCode) {
      const link = document.createElement("a");
      link.href = generatedQRCode;
      link.download = "mfa-qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyManualCode = async () => {
    if (mfaData?.manualCode) {
      try {
        await navigator.clipboard.writeText(mfaData.manualCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = mfaData.manualCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!mfaData) {
    return null; // Will redirect to login
  }

  const shouldShowSetup = !isSetupDone && !!mfaData.manualCode;

  return (
    <div className="h-screen overflow-hidden flex bg-slate-100">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 h-full flex-col px-10 py-8 xl:px-14 xl:py-10 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#0f172a_0%,#111827_42%,#0b2530_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative z-10 flex h-full min-h-0 flex-col justify-between">
          <img
            src="/logowhite.png"
            alt="Enviraan"
            className="h-11 w-auto object-contain object-left shrink-0"
          />

          <div className="max-w-lg">
            {/* Security mark */}
            <div className="mb-7 flex items-center gap-4">
              <div className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07]">
                <ShieldCheck
                  className="h-9 w-9 text-emerald-300"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex min-h-[4.5rem] flex-col justify-center gap-1">
                <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-emerald-300">
                  Secure access
                </p>
                <p className="text-sm font-semibold leading-tight text-white">
                  Enviraan identity verification
                </p>
                <p className="text-xs leading-none text-slate-400">
                  Authenticator-protected sign-in
                </p>
              </div>
            </div>

            <h1 className="text-3xl xl:text-[2.65rem] font-bold leading-[1.12] tracking-tight text-white">
              Confirm it&apos;s you
              <span className="block text-emerald-300">
                before we open your workspace.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-slate-300 text-sm xl:text-[15px] leading-relaxed">
              A short code from your authenticator app keeps PCF records and
              supplier data private — even if someone else has your password.
            </p>
          </div>

          <p className="text-xs text-slate-500 shrink-0">
            Compatible with Google Authenticator, Authy &amp; Microsoft
            Authenticator
          </p>
        </div>
      </div>

      {/* Right Panel - MFA card */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-6 py-6 sm:px-10 overflow-hidden">
        <div className="w-full max-w-md max-h-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.45)]">
          <div className="text-center mb-7">
            <div className="lg:hidden mb-5 flex justify-center">
              <img
                src="/logoblack.png"
                alt="Enviraan Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-emerald-600 mb-2">
              Two-factor authentication
            </p>
            <h2 className="text-[32px] leading-none font-bold text-slate-900 mb-2">
              Verify MFA
            </h2>
            <p className="text-slate-500 text-sm">
              {shouldShowSetup
                ? "Scan the QR code, then enter the 6-digit code from your authenticator app."
                : "Enter the 6-digit code from your authenticator app."}
            </p>
            {userEmail && (
              <p className="mt-2 text-xs text-slate-400">
                Signing in as{" "}
                <span className="font-medium text-slate-600">{userEmail}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-5">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <p className="ml-3 text-sm text-emerald-600">{success}</p>
              </div>
            </div>
          )}

          {/* MFA Setup (QR / Manual) only until completed */}
          {shouldShowSetup && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex rounded-lg bg-white border border-slate-200 p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                    showQR
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowQR(false)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                    !showQR
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Manual Code
                </button>
              </div>

              {showQR && generatedQRCode && (
                <div className="text-center">
                  <div className="inline-block rounded-xl border border-slate-200 bg-white p-3 mb-3">
                    <img
                      src={generatedQRCode}
                      alt="MFA QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Scan with Google Authenticator, Authy, or Microsoft Authenticator
                  </p>
                  <button
                    type="button"
                    onClick={downloadQRCode}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </button>
                </div>
              )}

              {!showQR && mfaData.manualCode && (
                <div>
                  <p className="text-xs text-slate-500 mb-3 text-center">
                    Can&apos;t scan? Enter this key in your authenticator app.
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
                    <div className="font-mono text-sm text-slate-800 break-all select-all text-center tracking-wide">
                      {mfaData.manualCode}
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                    <button
                      type="button"
                      onClick={copyManualCode}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                    <li>Open your authenticator app and add an account</li>
                    <li>
                      Account name:{" "}
                      <span className="font-medium text-slate-700">
                        Enviraan:{userEmail}
                      </span>
                    </li>
                    <li>Paste the key above and choose Time based</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="mfaToken"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Authentication code
              </label>
              <input
                id="mfaToken"
                name="mfaToken"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full px-4 py-3.5 border border-slate-200 rounded-lg placeholder-slate-300 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center text-2xl font-mono tracking-[0.35em] text-slate-900"
                placeholder="000000"
                value={mfaToken}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setMfaToken(value);
                }}
                disabled={isLoading}
                autoFocus={!shouldShowSetup}
              />
              <p className="mt-2 text-xs text-slate-400 text-center">
                Codes refresh every 30 seconds
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaToken.length !== 6}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-sm"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="border-white" />
              ) : (
                "Verify & Continue"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Sign In
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Having trouble?
            </p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Sync your device clock</li>
              <li>• Use the latest code from your authenticator</li>
              <li>• Confirm you&apos;re signed into the right account</li>
            </ul>
            <p className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
              Lost your authenticator?{" "}
              <Link
                to="/forgot-mfa"
                className="font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Reset MFA
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFAVerification;
