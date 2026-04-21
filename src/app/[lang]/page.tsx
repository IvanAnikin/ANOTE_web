import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n";
import { Hero } from "@/components/sections/Hero";

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
// Testimonials import kept for easy re-enable; currently not rendered
const Testimonials = dynamic(() =>
  import("@/components/sections/Testimonials").then((m) => m.Testimonials)
);
const TrustStrip = dynamic(() =>
  import("@/components/sections/TrustStrip").then((m) => m.TrustStrip)
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
      <HowItWorks dict={dict} />
      <Features dict={dict} />
      <DemoVideo dict={dict} />
      {/* Testimonials hidden until more doctor feedback is collected — re-enable by uncommenting */}
      {/* <Testimonials dict={dict} /> */}
      <TrustStrip lang={lang as Locale} dict={dict} />
      <BottomCTA dict={dict} compact lang={lang as Locale} />
    </main>
  );
}

