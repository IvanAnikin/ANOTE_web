import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n";
import { Hero } from "@/components/sections/Hero";
import { LogoBar } from "@/components/sections/LogoBar";

// Below-fold sections: dynamic imports for code splitting.
// HTML is still prerendered at build time (SSG) for SEO;
// JS chunks load separately, reducing initial bundle size.
const HowItWorks = dynamic(() =>
  import("@/components/sections/HowItWorks").then((m) => m.HowItWorks)
);
const Features = dynamic(() =>
  import("@/components/sections/Features").then((m) => m.Features)
);
const DemoVideo = dynamic(() =>
  import("@/components/sections/DemoVideo").then((m) => m.DemoVideo)
);
const ReportShowcase = dynamic(() =>
  import("@/components/sections/ReportShowcase").then((m) => m.ReportShowcase)
);
const VisitTypes = dynamic(() =>
  import("@/components/sections/VisitTypes").then((m) => m.VisitTypes)
);
const Privacy = dynamic(() =>
  import("@/components/sections/Privacy").then((m) => m.Privacy)
);
const Pricing = dynamic(() =>
  import("@/components/sections/Pricing").then((m) => m.Pricing)
);
const Testimonials = dynamic(() =>
  import("@/components/sections/Testimonials").then((m) => m.Testimonials)
);
const FAQ = dynamic(() =>
  import("@/components/sections/FAQ").then((m) => m.FAQ)
);
const BottomCTA = dynamic(() =>
  import("@/components/sections/BottomCTA").then((m) => m.BottomCTA)
);

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <main>
      <Hero dict={dict} />
      <LogoBar dict={dict} />
      <HowItWorks dict={dict} />
      <Features dict={dict} />
      <DemoVideo dict={dict} />
      <ReportShowcase dict={dict} />
      <VisitTypes dict={dict} />
      <Privacy dict={dict} />
      <Pricing dict={dict} />
      <Testimonials dict={dict} />
      <FAQ dict={dict} />
      <BottomCTA dict={dict} />
    </main>
  );
}

