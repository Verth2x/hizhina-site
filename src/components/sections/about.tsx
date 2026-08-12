import { Media } from '@/components/ui/media';
import type { Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';

export function About({ content, messages }: { content: SiteContent; messages: Messages }) {
  return (
    <section id="about" className="section-y">
      <div className="max-w-main gutter mx-auto grid items-start gap-10 md:grid-cols-12 lg:items-stretch">
        <div className="md:col-span-5">
          <p className="text-label text-text-muted uppercase">{messages.sections.aboutLabel}</p>
          <h2 className="text-h1 text-text-primary mt-5">{content.about.title}</h2>
          <div className="max-w-prose text-text-secondary mt-6 space-y-4">
            {content.about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="md:col-span-7 lg:py-3">
          <Media
            alt={content.about.title}
            source={content.about.image}
            ratio="4/3"
            placeholderLabel={messages.common.photoSoon}
            sizes="(min-width: 768px) 58vw, 100vw"
            className="media-fill rounded-lg lg:aspect-auto"
          />
        </div>
      </div>
    </section>
  );
}
