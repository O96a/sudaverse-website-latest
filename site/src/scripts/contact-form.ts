/**
 * Contact form behaviour. No dependencies.
 *
 * Progressive enhancement: the server-rendered form works without this script (native validation
 * and a mailto or endpoint `action`). With the script we validate inline, focus the first invalid
 * field, and submit by JSON POST when an endpoint is configured, otherwise open the visitor's
 * email app with the message ready to send.
 *
 * All strings and data arrive through `data-config` on the form, so this file holds no copy.
 */

interface Config {
  /** JSON POST target (PUBLIC_CONTACT_ENDPOINT). Empty means "use mailto". */
  endpoint: string;
  email: string;
  locale: string;
  /** slug -> Latin product name, for ?product= prefill. */
  products: Record<string, string>;
  /** topic key -> localized label, for ?topic= prefill and the email subject. */
  topics: Record<string, string>;
  text: {
    required: string;
    invalidEmail: string;
    send: string;
    sending: string;
    sent: string;
    mailto: string;
    error: string;
    /** Contains a {product} placeholder. */
    prefillProduct: string;
    labels: { name: string; organization: string; email: string };
  };
}

type FieldName = 'name' | 'organization' | 'email' | 'topic' | 'message';
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type StatusKind = 'success' | 'error' | 'info';

const REQUIRED: FieldName[] = ['name', 'email', 'topic', 'message'];
const ALL: FieldName[] = ['name', 'organization', 'email', 'topic', 'message'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readConfig(form: HTMLFormElement): Config | null {
  try {
    return JSON.parse(form.dataset.config ?? '') as Config;
  } catch {
    return null;
  }
}

function init(form: HTMLFormElement) {
  const cfg = readConfig(form);
  if (!cfg) return;

  const field = (name: FieldName) => form.querySelector<Field>(`[name="${name}"]`)!;
  const errorEl = (name: FieldName) => document.getElementById(`${field(name).id}-error`)!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const honeypot = form.querySelector<HTMLInputElement>('[name="website"]');

  // Without the script the browser validates natively; with it we own the messages.
  form.noValidate = true;

  let busy = false;

  /* ---------- prefill from ?topic= and ?product= ---------- */
  const params = new URLSearchParams(location.search);
  const topicParam = params.get('topic') ?? '';
  const productParam = params.get('product') ?? '';
  const productName = Object.hasOwn(cfg.products, productParam) ? cfg.products[productParam] : '';
  let topic = Object.hasOwn(cfg.topics, topicParam) ? topicParam : '';
  if (!topic && productName) topic = 'product';
  if (topic) field('topic').value = topic;
  const message = field('message') as HTMLTextAreaElement;
  if (productName && !message.value.trim()) {
    message.value = cfg.text.prefillProduct.replace('{product}', productName);
  }

  /* ---------- validation ---------- */
  const problem = (name: FieldName): string => {
    const value = field(name).value.trim();
    if (REQUIRED.includes(name) && !value) return cfg.text.required;
    if (name === 'email' && value && !EMAIL_RE.test(value)) return cfg.text.invalidEmail;
    return '';
  };

  const showProblem = (name: FieldName, text: string) => {
    const el = field(name);
    errorEl(name).textContent = text;
    if (text) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  };

  /** Validate every field. Returns the first invalid field, if any. */
  const validateAll = (): Field | null => {
    let first: Field | null = null;
    for (const name of ALL) {
      const text = problem(name);
      showProblem(name, text);
      if (text && !first) first = field(name);
    }
    return first;
  };

  // Once a field has been flagged, re-check it as the visitor fixes it.
  for (const name of ALL) {
    const el = field(name);
    const recheck = () => {
      if (el.getAttribute('aria-invalid') === 'true') showProblem(name, problem(name));
    };
    el.addEventListener('input', recheck);
    el.addEventListener('change', recheck);
  }

  /* ---------- status region ---------- */
  /** Write text into the live region; the company address becomes an LTR mailto link. */
  const say = (kind: StatusKind, text: string) => {
    status.dataset.kind = kind;
    status.replaceChildren();
    const parts = text.split(cfg.email);
    parts.forEach((part, i) => {
      if (i > 0) {
        const a = document.createElement('a');
        a.href = `mailto:${cfg.email}`;
        a.dir = 'ltr';
        a.textContent = cfg.email;
        status.append(a);
      }
      status.append(document.createTextNode(part));
    });
  };

  const setBusy = (on: boolean) => {
    busy = on;
    submit.setAttribute('aria-disabled', String(on));
    submit.toggleAttribute('data-busy', on);
    submitLabel.textContent = on ? cfg.text.sending : cfg.text.send;
  };

  /* ---------- submission ---------- */
  const values = () => ({
    name: field('name').value.trim(),
    organization: field('organization').value.trim(),
    email: field('email').value.trim(),
    topicKey: field('topic').value,
    topic: cfg.topics[field('topic').value] ?? '',
    message: field('message').value.trim(),
  });

  const openMailto = (v: ReturnType<typeof values>) => {
    const subject = `${v.topic}: ${v.name}`;
    const lines = [v.message, '', '--', `${cfg.text.labels.name}: ${v.name}`];
    if (v.organization) lines.push(`${cfg.text.labels.organization}: ${v.organization}`);
    lines.push(`${cfg.text.labels.email}: ${v.email}`);
    const body = lines.join('\r\n');
    const href = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say('info', cfg.text.mailto);
    window.location.href = href;
  };

  const postJson = async (v: ReturnType<typeof values>) => {
    setBusy(true);
    say('info', cfg.text.sending);
    try {
      const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: v.name,
          organization: v.organization,
          email: v.email,
          // The relay validates against the topic KEY, not the translated label.
          topic: v.topicKey,
          message: v.message,
          locale: cfg.locale,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      say('success', cfg.text.sent);
      form.reset();
      for (const name of ALL) showProblem(name, '');
    } catch {
      say('error', cfg.text.error);
    } finally {
      setBusy(false);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy) return;
    status.replaceChildren();
    delete status.dataset.kind;

    // Bots fill every input. Pretend success and send nothing.
    if (honeypot?.value) {
      say('success', cfg.text.sent);
      return;
    }

    const firstInvalid = validateAll();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const v = values();
    if (cfg.endpoint) void postJson(v);
    else openMailto(v);
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-contact-form]').forEach(init);
