# Sudaverse contact relay

The company site is static, and a static host cannot speak SMTP. This small Node service is the piece that makes contact-form messages actually arrive. The form POSTs JSON to it; the relay validates the message and delivers it to the company mailbox (`info@sudaverse.com`) by email over SMTP, and optionally to Telegram and Signal.

```
visitor's browser ── POST /contact (JSON) ──▶ relay ──┬─ SMTP ──▶ info@sudaverse.com
   (static site)                                       ├─ Telegram Bot API ──▶ your chat        (optional)
                                                       └─ signal-cli-rest-api ──▶ Signal        (optional)
```

- Node 22, ES modules, no web framework. One dependency: `nodemailer`.
- A channel is on only when its variables are set. At startup the relay logs which channels are on (never their secrets) and warns if none is.
- Nothing is stored. Logs contain request ids, channel names and status codes only: never names, addresses or message text.
- Honest scope: there is no queue or retry. If every channel fails the visitor gets an error (the form then shows the company address as a fallback).

## API

`POST /contact` with `Content-Type: application/json`

| Field | Rules |
| --- | --- |
| `name` | required, 1 to 120 characters (line breaks and control characters are replaced by spaces) |
| `organization` | optional, up to 160 characters |
| `email` | required, up to 254 characters, must look like an address |
| `topic` | required: `product`, `institutional`, `research`, `data`, `integration` or `other` |
| `message` | required, 1 to 5000 characters |
| `locale` | `en` or `ar`; anything else becomes `en` |
| `website` | honeypot: real visitors leave it empty (see below) |

| Status | Body | When |
| --- | --- | --- |
| 200 | `{"ok":true,"delivered":["email","telegram"]}` | at least one channel accepted the message |
| 200 | `{"ok":true}` | honeypot filled: nothing was sent |
| 400 | `{"ok":false,"error":"invalid_fields","fields":["email"]}` or `"invalid_json"` | field names only, never the submitted values |
| 403 | `forbidden_origin` | `Origin` missing or not in `ALLOWED_ORIGINS` |
| 413 / 415 | `payload_too_large` / `unsupported_media_type` | body over `MAX_BODY_BYTES`, or not JSON |
| 429 | `rate_limited` (with `Retry-After`) | more than `RATE_LIMIT` requests per address per window |
| 502 | `{"ok":false}` | every enabled channel failed |
| 503 | `{"ok":false,"error":"not_configured"}` | no channel configured |

`GET /health` returns `{"ok":true}`. Everything else is 404. `OPTIONS /contact` answers CORS preflights.

Delivery details: the email `From` is always `MAIL_FROM` (never the visitor); the visitor is `Reply-To`. Subject is `[Website] <topic label>: <name>` with a plain-text body and an HTML alternative in which everything is escaped. Channels run in parallel with a 10 second timeout each. Line breaks are stripped from anything that reaches a header, and the visitor's display name is cleaned before it is used in `Reply-To`.

Protection against abuse, in order: origin check, per-address rate limit (in memory: a restart resets it, and several instances each keep their own), body size limit, honeypot, strict validation. The origin check stops other websites from using a visitor's browser; it is not authentication (a script can forge the header), so the rate limit and honeypot are what slow scripted abuse. The honeypot only trips for a client that sends a non-empty `website` field in the JSON.

## Run locally

```sh
cd site/relay
npm install
cp .env.example .env        # fill in at least one channel; .env is git-ignored
npm run dev                 # node --env-file-if-exists=.env server.mjs (Node 22.9+)
```

Try it (the `Origin` header is required; `http://localhost:4321` is allowed outside production):

```sh
curl -s -X POST http://localhost:8787/contact \
  -H 'Content-Type: application/json' -H 'Origin: http://localhost:4321' \
  -d '{"name":"Test","email":"test@example.org","topic":"other","message":"Hello","locale":"en"}'
```

To watch email without real credentials, run a local catch-all SMTP server such as Mailpit (`docker run -p 1025:1025 -p 8025:8025 axllent/mailpit`) and set `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_REQUIRE_TLS=false`, then open http://localhost:8025.

`npm test` runs the test suite with `node --test`. It starts an in-process SMTP server and mocks `fetch`, so it needs no network and sends no real message.

By default, with `SMTP_SECURE=false` the relay insists on STARTTLS and refuses to send in clear text (`SMTP_REQUIRE_TLS=false` turns that off, for local test servers only).

## Deploy

The relay is a stateless container. Anything that can run a Docker image or `npm start` on Node 22 will do.

**Small VPS with Docker and Caddy**

1. Point a DNS name (for example `relay.example.com`) at the server, and install Docker.
2. Copy `site/relay` to the server, then `cp .env.example .env` and fill it in. Set `TRUST_PROXY=1` (Caddy sits in front) and check `ALLOWED_ORIGINS`.
3. `docker compose up -d --build`. The relay listens on `127.0.0.1:8787` only.
4. Put HTTPS in front. With Caddy, a `Caddyfile` of

   ```
   relay.example.com {
       reverse_proxy 127.0.0.1:8787
   }
   ```

   gets a certificate automatically. Check `https://relay.example.com/health`.
5. Update with `docker compose up -d --build`. Logs: `docker compose logs -f relay`.

**Free container host** (any platform that builds a Dockerfile or runs Node): build context `site/relay`, port from `PORT` (many platforms set it), health check path `/health`, secrets entered in the platform's environment settings, never in git. Check the host's current free-tier terms yourself. Two things commonly bite: idle services may sleep, so the first submission after a quiet period is slow; and some hosts block outbound SMTP on port 25, so use 587, 465 or the provider's alternative port.

`TRUST_PROXY` counts the proxies *you control* in front of the relay. Too low and every visitor looks like the proxy and shares one rate-limit budget; too high and a visitor can forge their address. Leave it empty if visitors reach the relay directly.

## Connect the site

The contact form reads its endpoint at build time. Build the site with

```sh
PUBLIC_CONTACT_ENDPOINT=https://<relay-host>/contact
```

and make sure `ALLOWED_ORIGINS` lists exactly the origins the site is served from (default in production: `https://www.sudaverse.com` and `https://sudaverse.com`). Without the variable the form falls back to opening the visitor's email app.

Two notes on the current `site/src/scripts/contact-form.ts` (not changed here):

- It posts `topic` as the localized label (for example "Product inquiry") rather than the key (`product`). The relay accepts the key and also the English and Arabic labels, so it works today. Sending `v.topicKey` instead is the cleaner contract.
- It never sends the `website` field; a filled honeypot is swallowed in the browser. The relay-side honeypot is for bots that post to the endpoint directly.

## Email: DNS for the sending domain

Mail from `no-reply@sudaverse.com` to `info@sudaverse.com` stays on one domain, so receiving servers check it closely. Without SPF and DKIM that pass, it will land in spam or be rejected. In your SMTP provider's dashboard add the sending domain; it shows the exact records. Add them at the DNS host, wait for the provider to mark the domain verified, then send a test and read the received headers (`spf=pass`, `dkim=pass`, `dmarc=pass`).

| Record | Name | Value |
| --- | --- | --- |
| SPF (TXT) | the domain itself | `v=spf1 include:<provider's SPF host> ~all`. A domain may have only one SPF record: merge new `include:` entries into the existing one. |
| DKIM (TXT or CNAME) | `<selector>._domainkey` | given by the provider; it signs outgoing mail with your domain |
| DMARC (TXT) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:<mailbox you read>`. Start at `p=none`, review the reports, then move to `p=quarantine` and later `p=reject`. |

`MAIL_FROM` must be on the domain (or subdomain) you verified. If you verify a subdomain, use an address on it.

## Telegram

1. In Telegram, open **@BotFather** (check for the verified badge) and send `/newbot`. Choose a display name and a username ending in `bot`. BotFather replies with the **bot token**: treat it as a password. This is `TELEGRAM_BOT_TOKEN`.
2. Open a chat with your new bot and press **Start** (a bot cannot message someone who never started it). To deliver to a group instead, add the bot to the group and send a message there (with privacy mode on, a `/command` or an @mention is what the bot sees).
3. Find the chat id: after sending that message, open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a private browser window and read `message.chat.id` from the JSON. Groups have negative ids. Use this as `TELEGRAM_CHAT_ID`.

Telegram messages are plain text (no `parse_mode`), so nothing a visitor types is interpreted as markup.

## Signal (optional, and the least dependable channel)

Read this first:

- Signal has **no official bot or automation API**. The relay talks to [`signal-cli-rest-api`](https://github.com/bbernhard/signal-cli-rest-api), a **community project** wrapping the community tool `signal-cli`.
- It needs its own always-on server process and a **dedicated number** (or a linked device of a number you already use).
- Signal may **restrict or block automated accounts**, and linked devices can be unlinked by Signal. It can stop working without notice.
- **Telegram and email are the dependable channels.** Treat Signal as a convenience on top of them.

Set it up:

1. Start the gateway: `docker compose --profile signal up -d signal` (in `docker-compose.yml`; state lives in the `signal-state` volume, mode `json-rpc`). It is not published on any host port and has no authentication: keep it that way, only the relay reaches it, over the compose network.
2. Link or register a number. Pick one:
   - **Link as a secondary device** (no new number): temporarily uncomment the `ports: 127.0.0.1:8080:8080` lines of the `signal` service, run `docker compose --profile signal up -d signal`, and from your own computer open an SSH tunnel (`ssh -L 8080:127.0.0.1:8080 <user>@<server>`). Open `http://localhost:8080/v1/qrcodelink?device_name=sudaverse-relay` and scan the QR code in Signal on your phone (**Settings > Linked devices > +**). The code changes on every request. Then re-comment the `ports` lines and run the command again.
   - **Register a dedicated number**: POST to the gateway's `/v1/register/<number>` (an SMS or voice code is sent; a captcha may be required), then `/v1/register/<number>/verify/<code>`. See the gateway's `doc/EXAMPLES.md`. Registering a number that already has Signal on a phone logs that phone out, so use a spare one.
3. As a precaution, restart the gateway once (`docker compose restart signal`), then set in `.env`: `SIGNAL_API_URL=http://signal:8080`, `SIGNAL_NUMBER=<the linked or registered number>`, `SIGNAL_RECIPIENTS=<comma-separated numbers>` (E.164, for example `+<country code><number>`).
4. Send a test from inside the network: `docker compose exec relay node -e "fetch('http://signal:8080/v2/send',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'relay test',number:process.env.SIGNAL_NUMBER,recipients:process.env.SIGNAL_RECIPIENTS.split(',')})}).then(r=>console.log(r.status))"`. A 2xx status means the gateway accepted it. If the sender number is also a recipient, check where Signal files the message (the gateway's docs do not cover this case).

## Choosing an SMTP provider

All six below offer SMTP. Figures are what each provider's own pages showed when I read them on **2026-09-21** (prices in USD, before tax). Free tiers and prices change: confirm on the page before you commit. Deliverability is the providers' own claim and was not measured.

| Provider | Free allowance | Cheapest paid | SMTP or API only | Custom domain required? | Read on 2026-09-21 |
| --- | --- | --- | --- | --- | --- |
| **Resend** | 3,000 emails/month, max 100/day, 3 domains | Pro $20/month: 50,000/month | SMTP relay listed under every plan (`smtp.resend.com`, ports 25, 465, 587, 2465, 2587, user `resend`, API key as password) and API | **Yes**: "You must add and verify at least one domain" | https://resend.com/pricing, https://resend.com/docs/send-with-smtp, https://resend.com/docs/dashboard/domains/introduction |
| **Brevo** | 300 emails/day (9,000/month by its own count), "free forever"; sending starts once Brevo approves the account | Starter $9/month: 5,000/month | SMTP relay and API, on all plans | Not stated on the pages I could read (its help centre returned 403 and the developer docs page 404 to my script). Domain authentication (SPF, DKIM, DMARC) is supported | https://www.brevo.com/pricing/, https://www.brevo.com/products/transactional-email/ |
| **Mailjet** | 6,000 emails/month, max 200/day | Starter $9/month: 8,000/month, no daily limit | SMTP relay (included in Free) and API | Not stated on the pages I could read (help article returned 403) | https://www.mailjet.com/pricing/, https://dev.mailjet.com/smtp-relay/overview/ |
| **SMTP2GO** | 1,000 emails/month, max 200/day, 25/hour until a sender domain is verified. Sign-up needs an address on your own domain (no Gmail or Yahoo) | Starter $10/month: 10,000/month (the page title still says "From $15/mo") | SMTP (ports 25, 80, 587, 2525, 8025) and API | Verifying a sender domain lifts the hourly cap; a mandatory domain is not stated | https://www.smtp2go.com/pricing/, https://www.smtp2go.com/faq/ |
| **Amazon SES** | No standing free allowance on its pricing page. New AWS customers get up to $200 in Free Tier credits (free plan for 6 months; credits must be used within 12 months) | Pay as you go: $0.10 per 1,000 emails, plus $0.12/GB of attachments | SMTP interface (separate SMTP credentials) and API | Needs a verified identity (domain or address). In the sandbox: verified recipients only, 200 messages per 24 hours, 1 per second, until you request production access | https://aws.amazon.com/ses/pricing/, https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html, https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html |
| **Mailgun** | 100 emails/day, 1 custom sending domain, 1 day of logs | Basic from $15/month: 10,000/month, no daily limit (Foundation $35/month for 50,000, first month free) | SMTP relay (`smtp.mailgun.org`, ports 25, 465, 587, 2525) and API | Effectively yes: the built-in sandbox domain only sends to pre-authorised recipients (up to 5). Its docs also mention a 300/day cap for unverified domains, which differs from the 100/day on the pricing page | https://www.mailgun.com/pricing/, https://documentation.mailgun.com/docs/mailgun/user-manual/domains/domains-sandbox, https://documentation.mailgun.com/docs/mailgun/user-manual/domains/domains-verify |

Pages that could not be read by my script: Brevo help centre (HTTP 403), Mailjet sender-domain help article (403), SMTP2GO support articles (403). Nothing was guessed from them.

**Recommendation for a low-volume company contact form: Resend.** A contact form sends a handful of messages a day, so free-tier size is not the deciding factor: 3,000 a month covers it many times over. What decides it:

1. SMTP relay is available on the free plan, so this relay works with plain SMTP settings and no code change (`SMTP_HOST=smtp.resend.com`, `SMTP_PORT=587`, `SMTP_USER=resend`, `SMTP_PASS=<API key>`).
2. It makes you verify your own domain (SPF and DKIM) before it sends anything, which is what protects a `From` address on `sudaverse.com`, and it can enforce TLS.
3. Setup is domain verification only; no account-approval step is described on its pages (Brevo's says sending starts once its team approves the account).

Weaker points: the 100 per day cap, and I did not measure deliverability. After setup, send a test to Gmail and Outlook and confirm `spf`, `dkim` and `dmarc` all pass. **Runner-up: Brevo** (largest free daily allowance, long-established, SMTP on every plan). Amazon SES is the cheapest at scale but its sandbox and AWS setup are overkill here.

## Files

| File | Purpose |
| --- | --- |
| `server.mjs` | `createServer(config)`, routing, CORS, `main()` |
| `lib/config.mjs` | defaults and environment parsing |
| `lib/validate.mjs`, `lib/format.mjs` | validation and sanitising; message formatting and escaping |
| `lib/ratelimit.mjs` | rate limiter and client-address handling |
| `lib/channels.mjs` | email, Telegram and Signal delivery with timeouts |
| `.env.example` | every variable, empty and commented |
| `Dockerfile`, `docker-compose.yml` | container image (non-root, health check) and compose stack with the optional `signal` profile |
| `test/` | `npm test`: SMTP round trip, mocked Telegram and Signal, validation, limits, CORS |
