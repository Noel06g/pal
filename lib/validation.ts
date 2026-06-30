import { z } from "zod";
import { FIELD_KEYS, OTHER_FIELD } from "@/lib/fields";

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
  );

export const commentSchema = z.object({
  ideaId: z.string().min(1),
  body: z.string().trim().min(2, "Komenti është shumë i shkurtër.").max(4000),
  stance,
  isSolution: z.boolean().default(false),
});

export const selfNominateSchema = z.object({
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
  fieldKey: z.string().refine((k) => FIELD_KEYS.includes(k), "Fushë e pavlefshme."),
  bio: z.string().trim().min(20, "Biografia duhet të jetë më e plotë.").max(3000),
  reason: z.string().trim().min(5, "Shkruaj arsyen.").max(2000),
  contact: z.string().trim().min(5, "Vendos një kontakt.").max(200),
});

export const nominateSchema = z.object({
  fieldKey: z.string().refine((k) => FIELD_KEYS.includes(k), "Fushë e pavlefshme."),
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
  bio: z.string().trim().min(10, "Shkruaj një biografi të shkurtër.").max(3000),
  reason: z.string().trim().min(5, "Shkruaj arsyen.").max(2000),
  contact: z.string().trim().min(5, "Vendos kontaktin e propozuar.").max(200),
  proposerName: z.string().trim().min(3, "Vendos emrin tënd.").max(120),
  proposerContact: z.string().trim().min(5, "Vendos kontaktin tënd.").max(200),
  fromIdeaId: z.string().min(1),
});

// Same as nominateSchema but not tied to an idea (used on the experts page).
export const nominateGeneralSchema = nominateSchema.omit({ fromIdeaId: true });

export const reportSchema = z.object({
  ideaId: z.string().min(1).optional(),
  commentId: z.string().min(1).optional(),
  reason: z.string().trim().min(5, "Shkruaj arsyen e raportimit.").max(2000),
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email i pavlefshëm."),
  name: z.string().trim().min(3, "Vendos emër e mbiemër.").max(120),
});

export type IdeaInput = z.infer<typeof ideaSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type SelfNominateInput = z.infer<typeof selfNominateSchema>;
export type NominateInput = z.infer<typeof nominateSchema>;
export type NominateGeneralInput = z.infer<typeof nominateGeneralSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
