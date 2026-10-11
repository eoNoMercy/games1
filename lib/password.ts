// Política de senha única, usada no formulário (aviso imediato) e no servidor (validação real).
export const PASSWORD_RULES: [string, (p: string) => boolean][] = [
  ["Pelo menos 12 caracteres", (p) => p.length >= 12],
  ["Letras maiúsculas e minúsculas", (p) => /[a-z]/.test(p) && /[A-Z]/.test(p)],
  ["Pelo menos um número", (p) => /\d/.test(p)],
  ["Pelo menos um símbolo (como ! ? # @)", (p) => /[^A-Za-z0-9]/.test(p)],
];
export function passwordProblem(p: string): string | null {
  if (p.length > 128) return "Use no máximo 128 caracteres.";
  const bad = PASSWORD_RULES.find(([, ok]) => !ok(p));
  if (bad) return `A senha precisa ter: ${bad[0].toLowerCase()}.`;
  if (/^(.)\1+$/.test(p) || /(password|senha|12345678|qwerty|admin)/i.test(p)) return "Essa senha é fácil de adivinhar. Escolha outra.";
  return null;
}
