# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Resend-powered transactional email helper.

Fire-and-forget by design: any error is logged but never bubbles up to the
caller so a failing email service doesn't break primary flows (user creation,
trial reminders, etc.).
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Optional

import resend

logger = logging.getLogger(__name__)

_API_KEY = os.environ.get("RESEND_API_KEY")
_FROM = os.environ.get("RESEND_FROM_EMAIL") or "onboarding@resend.dev"
_APP_URL = os.environ.get("APP_PUBLIC_URL") or "https://sdd-ia.com"

if _API_KEY:
    resend.api_key = _API_KEY


def is_configured() -> bool:
    return bool(_API_KEY)


async def send_email(
    to: str,
    subject: str,
    html: str,
    *,
    plain_text: Optional[str] = None,
    reply_to: Optional[str] = None,
) -> Optional[str]:
    """Send an email via Resend in a non-blocking thread.

    Returns the Resend `email_id` on success, None on failure.
    Never raises.
    """
    if not _API_KEY:
        logger.warning("Resend API key not configured; skipping email to %s", to)
        return None
    if not to:
        return None

    params = {
        "from": _FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if plain_text:
        params["text"] = plain_text
    if reply_to:
        params["reply_to"] = reply_to

    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        email_id = email.get("id") if isinstance(email, dict) else None
        logger.info("Resend email sent to=%s id=%s subject=%s", to, email_id, subject[:60])
        return email_id
    except Exception as e:
        logger.warning("Resend email FAILED to=%s subject=%s err=%s", to, subject[:60], e)
        return None


def render_welcome_email(
    *,
    user_name: str,
    user_email: str,
    role: str,
    created_by_admin: Optional[str] = None,
) -> tuple[str, str, str]:
    """Return (subject, html, plain_text) for the welcome email.

    Uses inline CSS + table layout for maximum email-client compatibility.
    """
    first_name = (user_name or "").split(" ")[0] or "allí"
    role_label = {
        "admin": "Administrador",
        "subscription": "Suscripción",
        "free": "Gratuito",
    }.get(role, role)

    subject = f"Bienvenido a SDD-IA, {first_name}"
    admin_line = (
        f"Tu cuenta fue creada por <strong>{created_by_admin}</strong>."
        if created_by_admin
        else "Tu cuenta acaba de ser creada."
    )
    admin_line_plain = (
        f"Tu cuenta fue creada por {created_by_admin}."
        if created_by_admin
        else "Tu cuenta acaba de ser creada."
    )

    login_url = f"{_APP_URL}/login"

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #e4e4e7;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#18181b;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-weight:900;font-size:18px;letter-spacing:-0.5px;">S</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <div style="font-size:18px;font-weight:900;color:#18181b;letter-spacing:-0.5px;">SDD-IA</div>
                    <div style="font-size:10px;color:#71717a;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Spec-Driven Development</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px 0;font-size:28px;font-weight:900;color:#18181b;line-height:1.2;letter-spacing:-0.5px;">
                ¡Bienvenido, {first_name}! 👋
              </h1>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                {admin_line} Ya puedes acceder a la plataforma con tu email corporativo.
              </p>

              <!-- Credentials box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border:1px solid #e4e4e7;margin:24px 0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:10px;color:#71717a;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Tu email de acceso</div>
                    <div style="font-size:16px;color:#18181b;font-weight:700;font-family:'SF Mono',Monaco,Consolas,monospace;">{user_email}</div>
                    <div style="font-size:10px;color:#71717a;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin:16px 0 4px 0;">Plan</div>
                    <div style="display:inline-block;padding:4px 10px;background-color:#2563eb;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">{role_label}</div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                Inicia sesión con <strong>Google</strong> usando ese email o usa el <strong>SSO de tu empresa</strong> si está configurado.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#2563eb;">
                    <a href="{login_url}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                      Acceder a SDD-IA →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What you can do -->
              <h2 style="margin:40px 0 16px 0;font-size:16px;font-weight:800;color:#18181b;letter-spacing:-0.3px;">
                ¿Qué puedes hacer en SDD-IA?
              </h2>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#3f3f46;line-height:1.6;">
                    🎯 Definir requisitos MoSCoW con RACI automatizado
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#3f3f46;line-height:1.6;">
                    🔀 Modelar procesos BPMN 2.0 con trazabilidad viva
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#3f3f46;line-height:1.6;">
                    🤖 Generar specs técnicas con IA (DeepSeek V4, MiniMax, MiMo)
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#3f3f46;line-height:1.6;">
                    📊 Ver impacto de cambios en tiempo real
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e4e4e7;background-color:#fafafa;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                ¿Problemas para acceder? Responde a este email o escribe a
                <a href="mailto:support@sdd-ia.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@sdd-ia.com</a>.
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#a1a1aa;">
                SDD-IA · Spec-Driven Development with AI ·
                <a href="{_APP_URL}" style="color:#a1a1aa;text-decoration:underline;">sdd-ia.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    plain = f"""¡Bienvenido a SDD-IA, {first_name}!

{admin_line_plain} Ya puedes acceder a la plataforma con tu email corporativo.

  Email de acceso: {user_email}
  Plan: {role_label}

Inicia sesión con Google usando ese email o con el SSO de tu empresa.

  → {login_url}

¿Qué puedes hacer en SDD-IA?
  • Definir requisitos MoSCoW con RACI automatizado
  • Modelar procesos BPMN 2.0 con trazabilidad viva
  • Generar specs técnicas con IA (DeepSeek V4, MiniMax, MiMo)
  • Ver impacto de cambios en tiempo real

¿Problemas para acceder? Escribe a support@sdd-ia.com

--
SDD-IA · Spec-Driven Development with AI · {_APP_URL}
"""

    return subject, html, plain
