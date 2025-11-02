<?php

namespace App\Services;

use App\Utils\Environment;

class EmailServiceRailway {
    private string $token = '';
    private string $fromEmail = '';
    private string $fromName = '';
    private bool $configured = false;

    public function __construct() {
        try {
            $this->token = Environment::get('RESEND_TOKEN');
            $this->fromEmail = Environment::get('SMTP_FROM_EMAIL');
            $this->fromName = Environment::get('SMTP_FROM_NAME');
            if (empty($this->token) || empty($this->fromEmail) || empty($this->fromName)) {
                throw new \Exception("Las variables de entorno RESEND_TOKEN, SMTP_FROM_EMAIL o SMTP_FROM_NAME no están configuradas correctamente.");
            }
            $this->configured = true;
        } catch (\Exception $e) {
            error_log("⚠️ No se pudo configurar EmailServiceRailway (Resend): " . $e->getMessage());
            if (!Environment::isDevelopment()) {
                throw $e;
            }
        }
    }

    public function enviarCodigoLogin(string $email, string $nombre, string $codigo): bool {
        if (!$this->configured) {
            error_log("⚠️ EmailServiceRailway no configurado. No se puede enviar email a {$email}");
            return false;
        }
        try {
            // Email de intercepción para desarrollo/testing
            $interceptEmail = Environment::get('EMAIL_INTERCEPT_TO', '');
            $originalEmail = $email;
            $originalNombre = $nombre;
            
            // Si hay email de intercepción configurado, redirigir todos los emails
            if (!empty($interceptEmail)) {
                error_log("🔀 [EmailServiceRailway] Interceptando email. Original: {$originalEmail} → Destino: {$interceptEmail}");
                $email = $interceptEmail;
                // Modificar el nombre para incluir info del destinatario original
                //$nombre = "TESTING";
            }
            
            error_log("[EmailServiceRailway] Iniciando envío de email a: {$email}");
            
            $subject = 'Código de acceso - Astillero La Roca';
            // Usar siempre el nombre original en el template, no el modificado por intercepción
            $htmlBody = $this->getLoginCodeTemplate($originalNombre, $codigo, $originalEmail);
            
            // Verificar que cURL esté disponible
            if (!function_exists('curl_init')) {
                error_log("❌ cURL no está disponible en este servidor PHP");
                return false;
            }
            
            error_log("[EmailServiceRailway] Preparando petición a Resend API");
            
            // Enviar email usando la API de Resend directamente con cURL
            $ch = curl_init('https://api.resend.com/emails');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $this->token,
                'Content-Type: application/json'
            ]);
            
            $payload = [
                'from' => $this->fromEmail,
                'to' => [$email],
                'subject' => $subject,
                'html' => $htmlBody
            ];
            
            error_log("[EmailServiceRailway] Payload: " . json_encode($payload));
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            error_log("[EmailServiceRailway] HTTP Code: {$httpCode}");
            error_log("[EmailServiceRailway] Response: {$response}");
            
            if (!empty($curlError)) {
                error_log("❌ cURL Error: {$curlError}");
                return false;
            }
            
            if ($httpCode === 200) {
                $result = json_decode($response, true);
                error_log("✅ Email enviado exitosamente a {$email}. ID: " . ($result['id'] ?? 'N/A'));
                return isset($result['id']) && !empty($result['id']);
            } else {
                error_log("❌ Error al enviar email (HTTP {$httpCode}): " . $response);
                return false;
            }
        } catch (\Exception $e) {
            error_log("❌ Excepción al enviar email (Resend): " . $e->getMessage());
            error_log("❌ Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    private function getLoginCodeTemplate(string $nombre, string $codigo, string $originalEmail = ''): string {
        $appUrl = Environment::get('APP_URL', 'https://ai4devs-finalproject-production.up.railway.app');
        
        // Si hay un email original (interceptado), mostrar banner de testing
        $testingBanner = '';
        if (!empty($originalEmail)) {
            $testingBanner = "
                <tr>
                    <td style='padding: 20px; background: #f59e0b; text-align: center;'>
                        <p style='margin: 0; color: #000; font-size: 14px; font-weight: 700;'>
                            🧪 MODO TESTING - Email destinado originalmente a: <strong>{$originalEmail}</strong>
                        </p>
                    </td>
                </tr>";
        }
        
        // ...existing code...
        return "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Código de Acceso - Astillero La Roca</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);'>
            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px;'>
                <tr>
                    <td align='center'>
                        <!-- Contenedor principal -->
                        <table width='600' cellpadding='0' cellspacing='0' border='0' style='max-width: 600px; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #334155;'>
                            
                            {$testingBanner}
                            
                            <!-- Header con logo -->
                            <tr>
                                <td align='center' style='padding: 40px 40px 30px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);'>
                                    <div style='width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);'>
                                        <svg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                            <path d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
                                        </svg>
                                    </div>
                            <h1 style='margin: 0; font-size: 32px; font-weight: 700; color: #22d3ee;'>Astillero La Roca</h1>
                            <p style='margin: 10px 0 0; color: #94a3b8; font-size: 16px;'>Sistema de Gestión de Herramientas</p>
                                </td>
                            </tr>
                            
                            <!-- Contenido -->
                            <tr>
                                <td style='padding: 40px;'>
                                    <h2 style='margin: 0 0 20px; color: #f1f5f9; font-size: 24px; font-weight: 600;'>Hola, $nombre</h2>
                                    <p style='margin: 0 0 30px; color: #cbd5e1; font-size: 16px; line-height: 1.6;'>
                                        Has solicitado acceso al Sistema de Gestión de Herramientas. Utiliza el siguiente código para completar tu inicio de sesión:
                                    </p>
                                    
                                    <!-- Código de acceso -->
                                    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin: 30px 0;'>
                                        <tr>
                                            <td align='center' style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px; border: 2px solid #334155;'>
                                                <p style='margin: 0 0 10px; color: #94a3b8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;'>Tu Código de Acceso</p>
                                                <h1 style='margin: 0; color: #22d3ee; font-size: 48px; font-weight: 700; letter-spacing: 8px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.3);'>$codigo</h1>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Información importante -->
                                    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin: 30px 0; background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;'>
                                        <tr>
                                            <td>
                                                <p style='margin: 0 0 10px; color: #fbbf24; font-size: 14px; font-weight: 600; display: flex; align-items: center;'>
                                                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' style='margin-right: 8px;'>
                                                        <path d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' stroke='#fbbf24' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
                                                    </svg>
                                                    Información Importante
                                                </p>
                                                <ul style='margin: 10px 0 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.8;'>
                                                    <li style='margin-bottom: 5px;'><strong style='color: #f1f5f9;'>Este código es válido por 15 minutos</strong></li>
                                                    <li style='margin-bottom: 5px;'>No compartas este código con nadie</li>
                                                    <li>Si no solicitaste este código, ignora este email</li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Botón de acceso -->
                                    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin: 30px 0;'>
                                        <tr>
                                            <td align='center'>
                                                <a href='$appUrl?codigo=$codigo&email=" . urlencode($originalEmail ?: $nombre) . "' style='display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);'>
                                                    Acceder al Sistema
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style='padding: 30px 40px; background: #0f172a; border-top: 1px solid #334155;'>
                                    <p style='margin: 0 0 10px; color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;'>
                                        Este es un mensaje automático del sistema de seguridad.<br>
                                        Por favor, no respondas a este email.
                                    </p>
                                    <p style='margin: 10px 0 0; color: #475569; font-size: 11px; text-align: center;'>
                                        © 2025 Astillero La Roca - Sistema de Gestión de Herramientas
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";
    }

    private function getLoginCodeTextTemplate(string $nombre, string $codigo): string {
        $appUrl = Environment::get('APP_URL', 'https://localhost');
        
        return "
╔═══════════════════════════════════════════════════════════╗
║          ASTILLERO LA ROCA                                ║
║    Sistema de Gestión de Herramientas                     ║
╚═══════════════════════════════════════════════════════════╝

Hola, $nombre

Has solicitado acceso al Sistema de Gestión de Herramientas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TU CÓDIGO DE ACCESO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                $codigo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ INFORMACIÓN IMPORTANTE:

• Este código es válido por 15 minutos
• No compartas este código con nadie
• Si no solicitaste este código, ignora este email

Accede al sistema: $appUrl

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este es un mensaje automático del sistema de seguridad.
Por favor, no respondas a este email.

© 2025 Astillero La Roca - Sistema de Gestión de Herramientas
";
    }
}