import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { faqs } from "@/lib/faqs";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "سوالات متداول | نئو رزین" },
      {
        name: "description",
        content: "پاسخ پرسش‌های رایج درباره سفارش، ارسال، نگهداری و مرجوعی آثار رزین نئو رزین.",
      },
      { property: "og:title", content: "سوالات متداول | نئو رزین" },
      { property: "og:description", content: "هرچه درباره خرید از نئو رزین باید بدانید." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <section className="section-y mx-auto max-w-3xl px-5 md:px-8">
      <SectionHeading
        eyebrow="FAQ"
        title="سوالات متداول"
        description="اگر پاسخ پرسشتان را پیدا نکردید، از صفحه تماس برایمان بنویسید."
      />
      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q${i}`} className="border-border/60">
            <AccordionTrigger className="text-right text-sm font-bold hover:text-gold">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-8 text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}