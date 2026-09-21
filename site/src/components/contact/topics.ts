import type { UiKey } from '@/i18n/ui';
import { site } from '@/config/site';
import { t } from '@/i18n/utils';
import type { Locale } from '@/i18n/config';

/** The contact topics, in display order. The key is what `?topic=` accepts. */
export const topicKeys = ['product', 'institutional', 'research', 'data', 'integration', 'other'] as const;
export type TopicKey = (typeof topicKeys)[number];

export const topicLabelKey = (key: TopicKey) => `topic.${key}` as UiKey;

/** WhatsApp chat is offered when a number is configured, or in preview builds (with a visible note). */
export const whatsappEnabled = Boolean(site.contact.whatsapp) || site.previewWhatsapp;

/** wa.me links per topic. Same logic as the floating launcher: with no number the links are inert. */
export function whatsappLinks(locale: Locale) {
  const number = site.contact.whatsapp;
  return topicKeys.map((key) => {
    const label = t(locale, topicLabelKey(key));
    const text = `${t(locale, 'wa.prefill')}${label}`;
    return {
      key,
      label,
      href: number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : '#',
      live: Boolean(number),
    };
  });
}
