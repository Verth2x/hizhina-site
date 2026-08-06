import type { Locale } from '@/i18n/config';
import { intlLocale } from '@/i18n/config';

/**
 * Текст политики конфиденциальности.
 *
 * Живёт отдельно от src/i18n/messages/*.json намеренно: это документ, а не
 * строки интерфейса. Держать его в общем словаре означало бы утащить
 * двенадцать килобайт юридического текста в клиентский бандл всякий раз,
 * когда словарь понадобится клиентскому компоненту (например, error-boundary).
 */

export type PolicySection = { title: string; body: string[] };

export type PrivacyPolicy = {
  title: string;
  updatedLabel: string;
  intro: string;
  sections: PolicySection[];
};

/**
 * Дата редакции. Намеренно константа, а не `new Date()`: дата должна меняться
 * тогда, когда меняется текст, а не при каждом деплое.
 */
export const PRIVACY_UPDATED_AT = '2026-08-06';

const ru: PrivacyPolicy = {
  title: 'Политика конфиденциальности',
  updatedLabel: 'Редакция от',
  intro:
    'Настоящая Политика объясняет, какие данные собирает сайт базы отдыха «Хижина», зачем и на каком основании. Политика составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».',
  sections: [
    {
      title: '1. Оператор',
      body: [
        'Оператором персональных данных является индивидуальный предприниматель Филимонова Татьяна Алексеевна.',
        'Связаться с оператором по вопросам обработки данных можно по адресу электронной почты или телефону, указанным в разделе «Контакты» на главной странице.',
      ],
    },
    {
      title: '2. Какие данные обрабатываются',
      body: [
        'Сайт не содержит форм регистрации, оплаты или отправки заявок. Персональные данные напрямую через сайт не собираются.',
        'Автоматически, средствами Яндекс.Метрики, собираются обезличенные данные о посещении: IP-адрес, тип и версия браузера, операционная система, разрешение экрана, источник перехода, просмотренные страницы, время на сайте, действия на странице (клики, прокрутка).',
        'Если вы переходите из попапа бронирования в Telegram, WhatsApp или звоните по телефону, дальнейшее общение происходит вне сайта. В переписке вы сообщаете имя, номер телефона, даты и состав брони — эти данные обрабатываются оператором для подтверждения и исполнения брони.',
      ],
    },
    {
      title: '3. Цели обработки',
      body: [
        'Обезличенные данные о посещениях используются только для оценки работы сайта: какие разделы читают, откуда приходят гости, какие каналы связи выбирают.',
        'Данные, сообщённые вами в переписке или по телефону, используются исключительно для бронирования, подтверждения, напоминания о заезде и связи по вопросам вашего проживания.',
      ],
    },
    {
      title: '4. Правовые основания',
      body: [
        'Обработка данных, сообщённых при бронировании, ведётся на основании вашего обращения и для исполнения договора оказания услуг, стороной которого вы являетесь (п. 5 ч. 1 ст. 6 Закона № 152-ФЗ).',
        'Сбор обезличенной статистики посещений ведётся на основании законного интереса оператора в оценке работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с использованием файлов cookie в этих целях.',
      ],
    },
    {
      title: '5. Файлы cookie и веб-аналитика',
      body: [
        'Сайт использует Яндекс.Метрику — сервис веб-аналитики ООО «ЯНДЕКС». Метрика применяет файлы cookie для распознавания повторных визитов и может записывать анонимные сессии (вебвизор).',
        'Отключить сбор статистики можно в настройках браузера (запрет cookie) или через страницу отказа Яндекс.Метрики. На работоспособность сайта это не влияет.',
      ],
    },
    {
      title: '6. Передача третьим лицам',
      body: [
        'Оператор не продаёт и не передаёт персональные данные третьим лицам в маркетинговых целях.',
        'Обезличенная статистика посещений обрабатывается ООО «ЯНДЕКС» на условиях его пользовательского соглашения.',
        'Переписка в Telegram и WhatsApp обрабатывается соответствующими мессенджерами на условиях их политик конфиденциальности. Оператор не контролирует эти сервисы и рекомендует ознакомиться с их условиями.',
      ],
    },
    {
      title: '7. Сроки хранения',
      body: [
        'Данные, сообщённые при бронировании, хранятся в течение срока, необходимого для оказания услуги, и далее — в течение срока, установленного законодательством для документов, подтверждающих оказание услуг.',
        'Обезличенная статистика хранится в Яндекс.Метрике в соответствии с настройками сервиса.',
      ],
    },
    {
      title: '8. Ваши права',
      body: [
        'Вы вправе запросить, какие ваши данные обрабатываются, потребовать их уточнения, блокирования или удаления, а также отозвать согласие на обработку.',
        'Для этого достаточно написать оператору по электронной почте, указанной в разделе «Контакты». Ответ направляется в срок, установленный законом.',
      ],
    },
    {
      title: '9. Защита данных',
      body: [
        'Сайт работает по протоколу HTTPS. Доступ к панели администрирования ограничен и защищён паролем.',
        'Оператор принимает разумные организационные и технические меры для защиты данных от неправомерного доступа, уничтожения, изменения и распространения.',
      ],
    },
    {
      title: '10. Изменения политики',
      body: [
        'Оператор вправе изменять настоящую Политику. Действующая редакция всегда доступна на этой странице; дата редакции указана вверху.',
        'Существенные изменения вступают в силу с момента публикации новой редакции.',
      ],
    },
  ],
};

const en: PrivacyPolicy = {
  title: 'Privacy policy',
  updatedLabel: 'Revision of',
  intro:
    'This policy explains what data the Hizhina retreat website collects, why, and on what legal basis. It follows Russian Federal Law No. 152-FZ of 27 July 2006 on personal data.',
  sections: [
    {
      title: '1. Operator',
      body: [
        'The data operator is Tatiana Filimonova, registered as a sole proprietor in the Russian Federation.',
        'For any question about data processing, write to the email address or call the phone number listed in the Contacts section of the home page.',
      ],
    },
    {
      title: '2. What data is processed',
      body: [
        'The website has no registration, payment or request forms. It does not collect personal data directly.',
        'Yandex.Metrica automatically collects anonymised visit data: IP address, browser type and version, operating system, screen resolution, referrer, pages viewed, time on site, and on-page actions such as clicks and scrolling.',
        'If you leave the booking popup for Telegram, WhatsApp or a phone call, the conversation continues outside this website. In that conversation you provide your name, phone number, dates and party size — the operator processes this to confirm and fulfil the booking.',
      ],
    },
    {
      title: '3. Purposes of processing',
      body: [
        'Anonymised visit data is used only to assess how the website performs: which sections are read, where guests come from, which contact channels they choose.',
        'Data you provide in a conversation or by phone is used solely for booking, confirmation, arrival reminders, and communication about your stay.',
      ],
    },
    {
      title: '4. Legal basis',
      body: [
        'Data provided when booking is processed on the basis of your enquiry and to perform the service contract to which you are a party (Art. 6(1)(5) of Law No. 152-FZ).',
        "Anonymised visit statistics are collected on the basis of the operator's legitimate interest in assessing the website. By continuing to use the site you consent to the use of cookies for this purpose.",
      ],
    },
    {
      title: '5. Cookies and web analytics',
      body: [
        'The site uses Yandex.Metrica, a web analytics service operated by Yandex LLC. Metrica uses cookies to recognise returning visits and may record anonymous sessions (Webvisor).',
        'You can disable statistics collection in your browser settings by blocking cookies, or through the Yandex.Metrica opt-out page. This does not affect how the site works.',
      ],
    },
    {
      title: '6. Sharing with third parties',
      body: [
        'The operator does not sell or share personal data with third parties for marketing purposes.',
        'Anonymised visit statistics are processed by Yandex LLC under its own terms of service.',
        'Conversations in Telegram and WhatsApp are processed by those messengers under their own privacy policies. The operator does not control these services and recommends reviewing their terms.',
      ],
    },
    {
      title: '7. Retention',
      body: [
        'Data provided when booking is retained for as long as needed to deliver the service, and afterwards for the period the law prescribes for records confirming services rendered.',
        "Anonymised statistics are retained in Yandex.Metrica according to that service's settings.",
      ],
    },
    {
      title: '8. Your rights',
      body: [
        'You may ask what data about you is processed, request its correction, blocking or deletion, and withdraw your consent to processing.',
        'To do so, write to the operator at the email address listed in the Contacts section. You will receive a reply within the period set by law.',
      ],
    },
    {
      title: '9. Data protection',
      body: [
        'The site runs over HTTPS. Access to the administration panel is restricted and password-protected.',
        'The operator takes reasonable organisational and technical measures to protect data against unlawful access, destruction, alteration and disclosure.',
      ],
    },
    {
      title: '10. Changes to this policy',
      body: [
        'The operator may amend this policy. The current version is always available on this page, with the revision date shown at the top.',
        'Material changes take effect when the new version is published.',
      ],
    },
  ],
};

const policies: Record<Locale, PrivacyPolicy> = { ru, en };

export function getPrivacyPolicy(locale: Locale): PrivacyPolicy {
  return policies[locale];
}

export function formatPolicyDate(locale: Locale, iso: string = PRIVACY_UPDATED_AT): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso + 'T00:00:00Z'));
}
