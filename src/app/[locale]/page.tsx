import { notFound } from 'next/navigation';
import { About } from '@/components/sections/about';
import { Cabins } from '@/components/sections/cabins';
import { Contacts } from '@/components/sections/contacts';
import { Extras } from '@/components/sections/extras';
import { Hero } from '@/components/sections/hero';
import { ServiceSection } from '@/components/sections/service-section';
import { getMessages, isLocale, type Locale } from '@/i18n/config';
import { getSiteContent } from '@/lib/content';
import { lodgingJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl } from '@/lib/site';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const messages = getMessages(typedLocale);
  const content = await getSiteContent(typedLocale);

  const furako = content.services.find((s) => s.key === 'furako');
  const banya = content.services.find((s) => s.key === 'banya');
  const commonHouse = content.services.find((s) => s.key === 'common_house');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(lodgingJsonLd(content, absoluteUrl('/' + typedLocale))),
        }}
      />
      <Hero content={content} messages={messages} />
      <About content={content} messages={messages} />
      <Cabins content={content} messages={messages} locale={typedLocale} />
      {furako ? (
        <ServiceSection
          id="furako"
          service={furako}
          messages={messages}
          tone="dark"
          mediaSide="left"
        />
      ) : null}
      {banya ? (
        <ServiceSection
          id="banya"
          service={banya}
          messages={messages}
          tone="light"
          mediaSide="right"
        />
      ) : null}
      {commonHouse ? (
        <ServiceSection
          id="common-house"
          service={commonHouse}
          messages={messages}
          tone="sunk"
          mediaSide="left"
        />
      ) : null}
      <Extras extras={content.extras} messages={messages} locale={typedLocale} />
      <Contacts settings={content.settings} messages={messages} />
    </>
  );
}
