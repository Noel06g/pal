import { fieldName, fieldShort } from "@/lib/fields";
import { fieldColor } from "@/lib/fieldColors";

/** A `.chip` tinted with the field's own accent color. */
export function FieldChip({
  fieldKey,
  full = false,
}: {
  fieldKey: string;
  full?: boolean;
}) {
  const c = fieldColor(fieldKey);
  return (
    <span
      className="chip"
      style={{ borderColor: c.border, color: c.fg, backgroundColor: c.bg }}
    >
      {full ? fieldName(fieldKey) : fieldShort(fieldKey)}
    </span>
  );
}
