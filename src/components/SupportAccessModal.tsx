import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "account", label: "Account & Access" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "data", label: "Data & Reporting" },
  { value: "feedback", label: "General Feedback" },
  { value: "other", label: "Other" },
] as const;

interface SupportAccessModalProps {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

const SupportAccessModal: React.FC<SupportAccessModalProps> = ({
  open,
  onClose,
  defaultEmail = "",
}) => {
  const [form, setForm] = useState({
    name: "",
    email: defaultEmail,
    category: "account",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      name: "",
      email: defaultEmail,
      category: "account",
      description: "",
    });
    setErrors({});
    setSending(false);
    setSent(false);
  }, [open, defaultEmail]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errors.submit) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.submit;
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email.";
    }
    if (!form.category) next.category = "Please select a category.";
    if (!form.description.trim()) next.description = "Please describe your request.";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSending(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE",
          name: form.name,
          email: form.email,
          subject: `Access Request: ${
            CATEGORIES.find((c) => c.value === form.category)?.label || form.category
          }`,
          message: form.description,
          from_name: "Enviraan Login Support",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSent(true);
      } else {
        setErrors({
          submit: result.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again later." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-access-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-emerald-600 mb-1">
              Support Center
            </p>
            <h2
              id="support-access-title"
              className="text-xl font-bold text-slate-900"
            >
              Request access
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tell us who you are and we&apos;ll help you get started.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close support form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {sent ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Request sent
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Thanks for reaching out. Our team typically responds within 24
                hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="support-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="support-name"
                  type="text"
                  className={`w-full rounded-lg border px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 ${
                    errors.name ? "border-red-300" : "border-slate-200"
                  }`}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={sending}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="support-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="support-email"
                  type="email"
                  className={`w-full rounded-lg border px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 ${
                    errors.email ? "border-red-300" : "border-slate-200"
                  }`}
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={sending}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleChange("category", category.value)}
                      disabled={sending}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.category === category.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="support-description"
                    className="block text-sm font-medium text-slate-700"
                  >
                    How can we help?
                  </label>
                  <span
                    className={`text-xs ${
                      form.description.length > 450
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {form.description.length} / 500
                  </span>
                </div>
                <textarea
                  id="support-description"
                  rows={4}
                  maxLength={500}
                  className={`w-full resize-none rounded-lg border px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 ${
                    errors.description ? "border-red-300" : "border-slate-200"
                  }`}
                  placeholder="Tell us about your company and the access you need..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={sending}
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {sending ? "Sending..." : "Submit request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportAccessModal;
