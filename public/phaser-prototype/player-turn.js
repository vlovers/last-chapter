/** Presentation only. Never infer spoken words from an action or a book title.
 * Editors can opt into explicit delivery/spokenText without changing save data.
 * Legacy authored speech is enclosed in Ukrainian quotation marks in full.
 */
export function spokenChoice(choice) {
  if (!choice || choice.id.startsWith('__') || choice.book || choice.delivery === 'action')
    return null;
  if (choice.delivery === 'speech') return choice.spokenText || choice.label;
  const label = choice.label.trim();
  return /^«[^]*»[.!?…]?$/.test(label) ? label : null;
}
