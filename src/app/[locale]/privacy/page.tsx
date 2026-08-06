import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMessages, isLocale, type Locale } from '@/i18n/config';
import { getSiteContent } from '@/lib/content';
import { formatPolicyDate, getPrivacyPolicy, PRIVACY_UPDATED_AT } from '@/lib/legal/privacy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const policy = getPrivacyPolicy(locale);

  return {
    title: policy.title,
    description: policy.intro,
    alternates: {
      canonical: '/' + locale + '/privacy',
      languages: { 'ru-RU': '/ru/privacy', 'en-US': '/en/privacy', 'x-default': '/ru/privacy' },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const messages = getMessages(typedLocale);
  const content = await getSiteContent(typedLocale);
  const t = getPrivacyPolicy(typedLocale);

  return (
    <article className="section-y gutter mx-auto max-w-3xl pt-32">
      <Link
        href={'/' + typedLocale}
        className="text-small text-text-secondary hover:text-text-primary inline-flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        {messages.actions.backHome}
      </Link>

      <h1 className="text-h1 text-text-primary mt-8">{t.title}</h1>

      <p className="text-meta text-text-muted mt-4 uppercase">
        {t.updatedLabel} {formatPolicyDate(typedLocale)}
      </p>

      <p className="text-lead text-text-secondary mt-8">{t.intro}</p>

      <div className="mt-12 space-y-10">
        {t.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-h3 text-text-primary">{section.title}</h2>
            <div className="text-text-secondary mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="border-border text-small text-text-secondary mt-14 border-t pt-8">
        <p className="text-text-primary">{content.brand.legalName}</p>
        <p className="tabular mt-1">
          {messages.footer.inn} {content.settings.inn} · {messages.footer.ogrnip}{' '}
          {content.settings.ogrnip}
        </p>
        <p className="mt-1">{content.settings.legalAddress}</p>
        <p className="mt-1">
          <a
            href={'mailto:' + content.settings.email}
            className="underline decoration-1 underline-offset-4"
          >
            {content.settings.email}
          </a>
        </p>
      </div>

      <p className="sr-only">{PRIVACY_UPDATED_AT}</p>
    </article>
  );
}
