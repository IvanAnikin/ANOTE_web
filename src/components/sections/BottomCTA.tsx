"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

export function BottomCTA({ dict }: { dict: Dictionary }) {
  const t = dict.bottomCta;

  const contactSchema = z.object({
    name: z.string().min(1, t.errors.nameRequired),
    email: z.string().email(t.errors.emailInvalid),
    phone: z.string().optional(),
    practiceType: z.string().optional(),
    message: z.string().optional(),
    gdpr: z.literal(true, {
      error: t.errors.gdprRequired,
    }),
  });

  type ContactFormValues = z.infer<typeof contactSchema>;

  const practiceOptions = t.practiceTypes.map((label) => ({
    value: label,
    label,
  }));

  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formStarted, setFormStarted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      practiceType: "",
      message: "",
    },
  });

  const handleFormFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackEvent("form_start");
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? t.serverError);
      }
      setSubmitted(true);
      trackEvent("form_submit");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : t.serverError,
      );
      trackEvent("form_error", { reason: err instanceof Error ? err.message : "unknown" });
    }
  };

  return (
    <section
      id="cta-bottom"
      className="py-24 sm:py-32 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden"
    >
      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.04] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {t.heading}
            </h2>
            <p className="mt-4 text-lg text-white/70">
              {t.subheading}
            </p>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <div className="max-w-lg mx-auto">
            {submitted ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-xl">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {t.successTitle}
                </h3>
                <p className="text-text-secondary">
                  {t.successMessage}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit, () => trackEvent("form_error", { reason: "validation" }))}
                onFocus={handleFormFocus}
                className="rounded-2xl bg-white p-8 sm:p-10 shadow-xl space-y-5"
                noValidate
              >
                <Input
                  label={t.labels.name}
                  placeholder={t.placeholders.name}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label={t.labels.email}
                  type="email"
                  placeholder={t.placeholders.email}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label={t.labels.phone}
                  type="tel"
                  placeholder={t.placeholders.phone}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <Select
                  label={t.labels.practiceType}
                  placeholder={t.placeholders.practiceType}
                  options={practiceOptions}
                  error={errors.practiceType?.message}
                  {...register("practiceType")}
                />
                <Textarea
                  label={t.labels.message}
                  placeholder={t.placeholders.message}
                  error={errors.message?.message}
                  {...register("message")}
                />
                <Checkbox
                  label={t.labels.gdpr}
                  error={errors.gdpr?.message}
                  {...register("gdpr")}
                />
                {serverError && (
                  <p className="text-sm text-error text-center">{serverError}</p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                >
                  {t.submit}
                </Button>
              </form>
            )}

            {/* Alternative contact */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/70">
              <a
                href="mailto:info@anote.cz"
                className="hover:text-white transition-colors"
              >
                📧 info@anote.cz
              </a>
              <span className="hidden sm:inline text-white/30">·</span>
              <span>📞 {t.phone}</span>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
