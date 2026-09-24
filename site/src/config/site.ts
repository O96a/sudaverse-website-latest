/**
 * Central, non-secret site configuration.
 * Anything marked "OPEN" is a decision or asset the owner still has to supply.
 * Nothing here may be invented: leave a value empty and the UI degrades gracefully.
 */
const env = import.meta.env;

export const site = {
  name: 'Sudaverse',
  origin: 'https://www.sudaverse.com',
  /** Descriptor used in the wordmark lockup and structured data. */
  descriptor: { en: 'AI & digital systems', ar: 'الذكاء الاصطناعي والأنظمة الرقمية' },
  /** Public company contact. Do not add personal addresses. */
  contact: {
    email: 'info@sudaverse.com',
    /** OPEN: WhatsApp Business number, digits with country code, e.g. 2499XXXXXXXX. Set PUBLIC_WHATSAPP_NUMBER. */
    whatsapp: (env.PUBLIC_WHATSAPP_NUMBER ?? '').replace(/[^\d]/g, ''),
    /** OPEN: Signal number in international format (digits, e.g. 2499XXXXXXXX), or set PUBLIC_SIGNAL_URL to a signal.me link. */
    signal: (env.PUBLIC_SIGNAL_URL ?? '').trim() || ((env.PUBLIC_SIGNAL_NUMBER ?? '').replace(/[^\d]/g, '') ? `https://signal.me/#p/+${(env.PUBLIC_SIGNAL_NUMBER ?? '').replace(/[^\d]/g, '')}` : ''),
    /** OPEN: Telegram username without the @ (public handle of the company account). Set PUBLIC_TELEGRAM_HANDLE. */
    telegram: (env.PUBLIC_TELEGRAM_HANDLE ?? '').replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, ''),
    /** OPEN: address of the contact relay that sends form messages by SMTP (and Telegram or Signal). Set PUBLIC_CONTACT_ENDPOINT, e.g. https://relay.example.com/contact. */
    formEndpoint: env.PUBLIC_CONTACT_ENDPOINT ?? '',
  },
  /** Profiles that already exist on the current public site. */
  social: {
    linkedin: 'https://linkedin.com/company/sudaverse',
    github: 'https://github.com/sudaverse',
    youtube: 'https://youtube.com/@sudaverse',
    x: 'https://twitter.com/sudaverse',
    instagram: 'https://www.instagram.com/sudaverse',
    facebook: 'https://www.facebook.com/profile.php?id=61579972150310',
  },
  /** Google Form already used by the legacy site for community sign-ups. */
  communityForm: 'https://forms.gle/xVNzEVbSoMPL1ooLA',
  /** Show the chat launcher in previews even without any channel configured (dev/preview builds only). */
  previewWhatsapp: env.DEV || env.PUBLIC_PREVIEW_WHATSAPP === '1',
} as const;

export type Site = typeof site;
