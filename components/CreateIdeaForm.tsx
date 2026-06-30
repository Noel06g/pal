"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIdea } from "@/app/actions/ideas";
import { useToast } from "@/components/Toast";
import { FIELDS, OTHER_FIELD, fieldSubs } from "@/lib/fields";
import { t } from "@/lib/strings";

export function CreateIdeaForm() {
  const router = useRouter();
  const toast = useToast();
  const [fieldKey, setFieldKey] = useState("");
  const [pending, setPending] = useState(false);

  const subs = fieldKey && fieldKey !== OTHER_FIELD.key ? fieldSubs(fieldKey) : [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await createIdea(fd);
    setPending(false);
    if (res.ok) {
      toast(t.toast.ideaCreated, "success");
      router.push(`/idete/${res.data?.id ?? ""}`);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">
          {t.forms.ideaTitle}
        </label>
        <input id="title" name="title" required maxLength={160} className="input" placeholder={t.forms.ideaTitlePh} />
      </div>

      <div>
        <label className="label" htmlFor="summary">
          {t.forms.ideaSummary}
        </label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={7}
          maxLength={6000}
          className="input resize-y"
          placeholder={t.forms.ideaSummaryPh}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fieldKey">
            {t.forms.ideaField}
          </label>
          <select
            id="fieldKey"
            name="fieldKey"
            required
            className="input"
            value={fieldKey}
            onChange={(e) => setFieldKey(e.target.value)}
          >
            <option value="" disabled>
              {t.forms.chooseField}
            </option>
            {FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.n}. {f.name}
              </option>
            ))}
            <option value={OTHER_FIELD.key}>
              {FIELDS.length + 1}. {OTHER_FIELD.name} — Specifiko
            </option>
          </select>
        </div>

        {fieldKey === OTHER_FIELD.key ? (
          <div>
            <label className="label" htmlFor="otherText">
              {t.forms.ideaOther}
            </label>
            <input id="otherText" name="otherText" className="input" placeholder={t.forms.ideaOtherPh} />
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="subfield">
              {t.forms.ideaSubfield}
            </label>
            <select id="subfield" name="subfield" className="input" defaultValue="">
              <option value="">{t.forms.chooseSubfield}</option>
              {subs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="documents">
          {t.forms.ideaDocs}
        </label>
        <input
          id="documents"
          name="documents"
          type="file"
          accept="application/pdf"
          multiple
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-teal-tint file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-teal-dk"
        />
        <p className="hint">PDF, maks. 10 MB. Dokumentet janë publike.</p>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? t.common.loading : t.forms.ideaSubmit}
      </button>
    </form>
  );
}
