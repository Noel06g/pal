import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const BRAND = env.NEXT_PUBLIC_SITE_NAME;
const APP_URL = env.NEXT_PUBLIC_APP_URL;

/** Minimal, clean HTML shell shared by all Pal emails. */
function layout(opts: { heading: string; body: string; cta?: { label: string; href: string } }) {
  const { heading, body, cta } = opts;
  return `<!doctype html>
<html lang="sq">
  <body style="margin:0;background:#F1F2EE;font-family:Inter,Arial,Helvetica,sans-serif;color:#1A2230;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F2EE;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E1E2DD;border-radius:14px;overflow:hidden;">
          <tr><td style="padding:24px 28px;border-bottom:1px solid #E1E2DD;">
            <span style="font-weight:800;font-size:20px;letter-spacing:-0.5px;color:#13615C;">${BRAND}</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#1A2230;">${heading}</h1>
            <div style="font-size:15px;line-height:1.6;color:#1A2230;">${body}</div>
            ${
              cta
                ? `<div style="margin:24px 0 8px;">
                     <a href="${cta.href}" style="display:inline-block;background:#13615C;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">${cta.label}</a>
                   </div>
                   <p style="font-size:12px;color:#5C6672;margin:12px 0 0;word-break:break-all;">Ose kopjo këtë lidhje: ${cta.href}</p>`
                : ""
            }
          </td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #E1E2DD;font-size:12px;color:#5C6672;">
            ${BRAND} — Nismë e pavarur qytetare · pa parti · pa institucione.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function send(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

/** 1. Magic-link sign-in email. */
export async function sendMagicLinkEmail(to: string, url: string) {
  const html = layout({
    heading: `Hyr në ${BRAND}`,
    body: `<p style="margin:0;">Kliko butonin më poshtë për të hyrë në ${BRAND}. Lidhja vlen për një kohë të kufizuar dhe mund të përdoret vetëm një herë.</p>`,
    cta: { label: `Hyr në ${BRAND}`, href: url },
  });
  await send(to, `Hyr në ${BRAND}`, html);
}

/** 2. New comment on your idea. */
export async function sendNewCommentEmail(to: string, ideaTitle: string, ideaId: string) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const html = layout({
    heading: "Koment i ri në idenë tënde",
    body: `<p style="margin:0;">Dikush komentoi idenë tënde «<strong>${escapeHtml(ideaTitle)}</strong>».</p>`,
    cta: { label: "Shiko komentin", href },
  });
  await send(to, `Koment i ri në «${ideaTitle}»`, html);
}

/** 3. An expert was proposed for your idea. */
export async function sendExpertProposedEmail(to: string, ideaTitle: string, ideaId: string) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const html = layout({
    heading: "U propozua një ekspert për idenë tënde",
    body: `<p style="margin:0;">U propozua një ekspert për idenë tënde «<strong>${escapeHtml(ideaTitle)}</strong>». Pasi eksperti ta konfirmojë, do të shfaqet publikisht.</p>`,
    cta: { label: "Shiko idenë", href },
  });
  await send(to, `U propozua një ekspert për «${ideaTitle}»`, html);
}

/** 4. Confirmation request to a proposed expert (accept / reject links). */
export async function sendExpertConfirmEmail(
  to: string,
  proposedName: string,
  fieldName: string,
  token: string,
) {
  const acceptHref = `${APP_URL}/ekspertet/konfirmo/${token}?vendim=prano`;
  const rejectHref = `${APP_URL}/ekspertet/konfirmo/${token}?vendim=refuzo`;
  const html = layout({
    heading: `Je propozuar si ekspert në ${BRAND}`,
    body: `<p style="margin:0 0 12px;">Përshëndetje ${escapeHtml(proposedName)},</p>
           <p style="margin:0 0 12px;">Dikush të ka propozuar si ekspert në fushën <strong>${escapeHtml(fieldName)}</strong> në ${BRAND}.</p>
           <p style="margin:0 0 16px;">Nëse <strong>pranon</strong>, emri, fusha dhe biografia jote bëhen publike. Kontakti dhe CV-ja mbeten <strong>private</strong> (vetëm administrata i sheh).</p>
           <div>
             <a href="${acceptHref}" style="display:inline-block;background:#13615C;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;margin-right:8px;">Prano</a>
             <a href="${rejectHref}" style="display:inline-block;background:#F4E8E8;color:#A33A3A;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">Refuzo</a>
           </div>
           <p style="font-size:12px;color:#5C6672;margin:16px 0 0;">Nëse nuk e ke pritur këtë email, thjesht injoroje ose kliko “Refuzo”.</p>`,
  });
  await send(to, `Je propozuar si ekspert në ${BRAND}`, html);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
