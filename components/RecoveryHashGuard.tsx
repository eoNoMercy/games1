"use client";
import { useEffect } from "react";

// Links antigos do Supabase trazem a sessão no endereço (depois do #). Descartamos esse conteúdo sem usá-lo
// e levamos a pessoa para pedir um link novo e seguro.
export default function RecoveryHashGuard() {
  useEffect(() => {
    // Se o Supabase mandar o código para a página inicial (endereço de retorno não liberado), levamos ao lugar certo.
    const code = new URLSearchParams(window.location.search).get("code");
    if (window.location.pathname === "/" && code) {
      window.history.replaceState(null, "", "/");
      window.location.replace(`/admin/redefinir-senha?code=${encodeURIComponent(code)}`);
      return;
    }
    const h = window.location.hash;
    if (h.length > 1 && (/type=recovery/.test(h) || /error_code=otp_expired/.test(h))) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.location.replace(`/admin/esqueci-senha?motivo=${/error_code=otp_expired/.test(h) ? "expirado" : "link"}`);
    }
  }, []);
  return null;
}
