import { z } from "zod";
import { FIELD_KEYS, OTHER_FIELD, fieldSubs } from "@/lib/fields";

const stance = z.enum(["PRO", "KUNDER", "NEUTRAL"]);

export const ideaSchema = z
  .object({
    title: z.string().trim().min(6, "Titulli është shumë i shkurtër.").max(160),
    summary: z
      .string()
      .trim()
      .min(30, "Përmbledhja duhet të jetë më e detajuar.")
      .max(6000),
    fieldKey: z.string().refine((k) => FIELD_KEYS.includes(k), "Fushë e pavlefshme."),
    subfield: z.string().trim().max(120).optional().or(z.literal("")),
    otherText: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine(
    (d) => d.fieldKey !== OTHER_FIELD.key || (d.otherText && d.otherText.length >= 3),
    { message: "Shpjego fushën kur zgjedh «Tjetër».", path: ["otherText"] },
  )
  // A subfield must belong to the chosen field (never free text).
  .refine((d) => !d.subfield || fieldSubs(d.fieldKey).includes(d.subfield), {
    message: "Nënfushë e pavlefshme.",
    path: ["subfield"],
  });

export const commentSchema = z.object({
  ideaId: z.string().min(1),
  body: z.string().trim().min(2, "Komenti është shumë i shkurtër.").max(4000),
  stance,
  isSolution: z.boolean().default(false),
});

// ── Experts (v2) ──────────────────────────────────────────────
const areasField = z
  .array(z.string())
  .min(1, "Zgjidh të paktën një fushë.")
  .max(3, "Zgjidh deri në 3 fusha.")
  .refine((a) => a.every((k) => FIELD_KEYS.includes(k)), "Fushë e pavlefshme.");

/** Vetëpropozohu: an account owner registers their own profile (CV required, checked separately). */
export const selfRegisterSchema = z.object({
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
  areas: areasField,
  bio: z.string().trim().min(20, "Biografia duhet të jetë më e plotë.").max(3000),
  reason: z.string().trim().min(5, "Shkruaj arsyen.").max(2000),
  contact: z.string().trim().min(5, "Vendos një kontakt.").max(200),
});

/** Propose a brand-new person from an idea. */
export const nominateNewSchema = z.object({
  ideaId: z.string().min(1),
  areas: areasField,
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
  bio: z.string().trim().min(10, "Shkruaj një biografi të shkurtër.").max(3000),
  reason: z.string().trim().min(5, "Shkruaj arsyen.").max(2000),
  contact: z.string().trim().min(5, "Vendos kontaktin e propozuar.").max(200),
  proposerName: z.string().trim().min(3, "Vendos emrin tënd.").max(120),
  proposerContact: z.string().trim().min(5, "Vendos kontaktin tënd.").max(200),
});

/** Propose a brand-new person from the experts directory (not tied to an idea). */
export const nominateNewGeneralSchema = nominateNewSchema.omit({ ideaId: true });

/** Link an existing expert to an idea (optionally suggest a bio edit -> admin queue). */
export const proposeExistingSchema = z.object({
  ideaId: z.string().min(1),
  expertId: z.string().min(1),
  suggestBio: z.string().trim().max(3000).optional().or(z.literal("")),
});

/** Owner edits their own published profile (goes live immediately). */
export const expertEditSchema = z.object({
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
  areas: areasField,
  bio: z.string().trim().min(20, "Biografia duhet të jetë më e plotë.").max(3000),
  contact: z.string().trim().min(5, "Vendos një kontakt.").max(200),
});

export const reportSchema = z
  .object({
    ideaId: z.string().min(1).optional(),
    commentId: z.string().min(1).optional(),
    reason: z.string().trim().min(5, "Shkruaj arsyen e raportimit.").max(2000),
  })
  // Exactly one target: either an idea or a comment.
  .refine((d) => Boolean(d.ideaId) !== Boolean(d.commentId), {
    message: "Raportimi duhet të ketë një objekt të vetëm.",
  });

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email i pavlefshëm."),
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
});

export type IdeaInput = z.infer<typeof ideaSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type SelfRegisterInput = z.infer<typeof selfRegisterSchema>;
export type NominateNewInput = z.infer<typeof nominateNewSchema>;
export type NominateNewGeneralInput = z.infer<typeof nominateNewGeneralSchema>;
export type ProposeExistingInput = z.infer<typeof proposeExistingSchema>;
export type ExpertEditInput = z.infer<typeof expertEditSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
