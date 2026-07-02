import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const BRAND = env.NEXT_PUBLIC_SITE_NAME;
const APP_URL = env.NEXT_PUBLIC_APP_URL;

/** Minimal, clean HTML shell shared by all Pal emails. */
function layout(opts: {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  const { heading, body, cta } = opts;
  return `<!doctype html>
<html lang="sq">
  <body style="margin:0;background:#F5F4F0;font-family:-apple-system,'Segoe UI',Arial,Helvetica,sans-serif;color:#222222;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #D8D4CF;overflow:hidden;">
          <tr><td style="padding:24px 28px;border-bottom:1px solid #D8D4CF;">
            <span style="font-weight:700;font-size:20px;letter-spacing:-0.5px;color:#0000FF;">${BRAND}</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#222222;">${heading}</h1>
            <div style="font-size:15px;line-height:1.6;color:#222222;">${body}</div>
            ${
              cta
                ? `<div style="margin:24px 0 8px;">
                     <a href="${cta.href}" style="display:inline-block;background:#0000FF;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;">${cta.label}</a>
                   </div>
                   <p style="font-size:12px;color:#555555;margin:12px 0 0;word-break:break-all;">Ose kopjo këtë lidhje: ${cta.href}</p>`
                : ""
            }
          </td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #D8D4CF;font-size:12px;color:#555555;">
            ${BRAND} — Nismë e pavarur qytetare.
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
export async function sendNewCommentEmail(
  to: string,
  ideaTitle: string,
  ideaId: string,
) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const html = layout({
    heading: "Koment i ri në idenë tënde",
    body: `<p style="margin:0;">Dikush komentoi idenë tënde «<strong>${escapeHtml(ideaTitle)}</strong>».</p>`,
    cta: { label: "Shiko komentin", href },
  });
  await send(to, `Koment i ri në «${ideaTitle}»`, html);
}

function twoButtons(
  acceptHref: string,
  rejectHref: string,
  acceptLabel = "Prano",
  rejectLabel = "Refuzo",
) {
  return `<div>
    <a href="${acceptHref}" style="display:inline-block;background:#0000FF;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;margin-right:8px;">${acceptLabel}</a>
    <a href="${rejectHref}" style="display:inline-block;background:#ffffff;border:1px solid #EB5E28;color:#EB5E28;text-decoration:none;font-weight:600;font-size:15px;padding:11px 21px;">${rejectLabel}</a>
  </div>`;
}

/** 1. Invite an existing expert to approve a specific idea-link (accept/reject by email). */
export async function sendIdeaInviteEmail(
  to: string,
  expertName: string,
  ideaTitle: string,
  token: string,
) {
  const acceptHref = `${APP_URL}/ekspertet/ide/${token}?vendim=prano`;
  const rejectHref = `${APP_URL}/ekspertet/ide/${token}?vendim=refuzo`;
  const html = layout({
    heading: `Je propozuar si ekspert për një ide`,
    body: `<p style="margin:0 0 12px;">Përshëndetje ${escapeHtml(expertName)},</p>
           <p style="margin:0 0 12px;">Je propozuar si ekspert për idenë «<strong>${escapeHtml(ideaTitle)}</strong>» në ${BRAND}.</p>
           <p style="margin:0 0 16px;">Duke pranuar, kontakti yt i jepet autorit të idesë dhe ti merr kontaktin e tij, që të bisedoni jashtë platformës.</p>
           ${twoButtons(acceptHref, rejectHref)}
           <p style="font-size:12px;color:#555555;margin:16px 0 0;">Nëse nuk e ke pritur këtë email, thjesht injoroje ose kliko “Refuzo”.</p>`,
  });
  await send(to, `Je propozuar si ekspert për «${ideaTitle}»`, html);
}

/** 2. Confirm a brand-new nomination (accept makes name/areas/bio public after admin review). */
export async function sendNomineeConfirmEmail(
  to: string,
  name: string,
  token: string,
) {
  const acceptHref = `${APP_URL}/ekspertet/konfirmo/${token}?vendim=prano`;
  const rejectHref = `${APP_URL}/ekspertet/konfirmo/${token}?vendim=refuzo`;
  const html = layout({
    heading: `Je propozuar si ekspert në ${BRAND}`,
    body: `<p style="margin:0 0 12px;">Përshëndetje ${escapeHtml(name)},</p>
           <p style="margin:0 0 12px;">Dikush të ka propozuar si ekspert në ${BRAND}.</p>
           <p style="margin:0 0 16px;">Nëse <strong>pranon</strong>, emri, fushat dhe biografia jote bëhen publike pas shqyrtimit nga administrata. Kontakti dhe CV-ja mbeten <strong>private</strong> (vetëm administratorët e faqes). Në faqen e konfirmimit mund të ngarkosh CV-në dhe të krijosh një llogari.</p>
           ${twoButtons(acceptHref, rejectHref)}
           <p style="font-size:12px;color:#555555;margin:16px 0 0;">Nëse nuk e ke pritur këtë email, thjesht injoroje ose kliko “Refuzo”.</p>`,
  });
  await send(to, `Je propozuar si ekspert në ${BRAND}`, html);
}

/** 3. Tell the idea author their proposal is pending the expert's reply. */
export async function sendExpertProposedToAuthorEmail(
  to: string,
  ideaTitle: string,
  ideaId: string,
) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const html = layout({
    heading: "U propozua një ekspert për idenë tënde",
    body: `<p style="margin:0;">U propozua një ekspert për idenë tënde «<strong>${escapeHtml(ideaTitle)}</strong>»; në pritje të përgjigjes së tij.</p>`,
    cta: { label: "Shiko idenë", href },
  });
  await send(to, `U propozua një ekspert për «${ideaTitle}»`, html);
}

/** 4. The expert responded; on accept include the expert's contact. */
export async function sendExpertResponseToAuthorEmail(
  to: string,
  ideaTitle: string,
  ideaId: string,
  accepted: boolean,
  expertContact?: string,
) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const body = accepted
    ? `<p style="margin:0 0 12px;">Eksperti pranoi propozimin për idenë «<strong>${escapeHtml(ideaTitle)}</strong>».</p>
       <p style="margin:0;">Kontakti i ekspertit: <strong>${escapeHtml(expertContact ?? "")}</strong>. Mund ta kontaktoni jashtë platformës.</p>`
    : `<p style="margin:0;">Eksperti nuk e pranoi propozimin për idenë «<strong>${escapeHtml(ideaTitle)}</strong>».</p>`;
  const html = layout({
    heading: accepted ? "Eksperti pranoi" : "Eksperti nuk pranoi",
    body,
    cta: { label: "Shiko idenë", href },
  });
  await send(to, `Përgjigje për «${ideaTitle}»`, html);
}

/** 5. Give the expert the author's contact on acceptance. */
export async function sendAuthorContactToExpertEmail(
  to: string,
  ideaTitle: string,
  ideaId: string,
  authorContact: string,
) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const html = layout({
    heading: "Kontakti i autorit të idesë",
    body: `<p style="margin:0 0 12px;">Faleminderit që pranove propozimin për idenë «<strong>${escapeHtml(ideaTitle)}</strong>».</p>
           <p style="margin:0;">Kontakti i autorit: <strong>${escapeHtml(authorContact)}</strong>. Mund ta kontaktoni jashtë platformës.</p>`,
    cta: { label: "Shiko idenë", href },
  });
  await send(to, `Kontakti i autorit për «${ideaTitle}»`, html);
}

/** 6. Expert signalled "po e marr përsipër" — author confirms (idea then auto-archives). */
export async function sendTakeoverConfirmEmail(
  to: string,
  ideaTitle: string,
  ideaId: string,
) {
  const href = `${APP_URL}/idete/${ideaId}`;
  const html = layout({
    heading: "Një ekspert po e merr përsipër idenë tënde",
    body: `<p style="margin:0;">Një ekspert shprehu se po e merr përsipër idenë «<strong>${escapeHtml(ideaTitle)}</strong>». Konfirmo në faqen e idesë; pas konfirmimit ideja arkivohet.</p>`,
    cta: { label: "Konfirmo", href },
  });
  await send(to, `Konfirmo marrjen përsipër të «${ideaTitle}»`, html);
}

/** 7. Admin published or rejected an expert profile. */
export async function sendProfileDecisionEmail(
  to: string,
  name: string,
  published: boolean,
) {
  const html = layout({
    heading: published ? "Profili yt u publikua" : "Profili yt nuk u miratua",
    body: published
      ? `<p style="margin:0;">Përshëndetje ${escapeHtml(name)}, profili yt si ekspert u miratua dhe tani është publik në ${BRAND}.</p>`
      : `<p style="margin:0;">Përshëndetje ${escapeHtml(name)}, profili yt si ekspert nuk u miratua. Të dhënat e tua nuk publikohen.</p>`,
    cta: published
      ? { label: "Shiko ekspertët", href: `${APP_URL}/ekspertet` }
      : undefined,
  });
  await send(
    to,
    published ? `Profili yt u publikua` : `Profili yt nuk u miratua`,
    html,
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
