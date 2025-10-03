"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import NotificationToast from "./NotificationToast"

/**
 * Componente que verifica si hay un usuario autenticado y redirige
 * desde páginas públicas (login/register) hacia la página principal.
 * 
 * Muestra una notificación durante el proceso de redirección.
 * 
 * Este componente es cliente-side only para evitar problemas con SSR
 * ya que localStorage no está disponible en el servidor.
 */
const AuthRedirect = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [isChecking, setIsChecking] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  useEffect(() => {
    // Ejecutar solo en el cliente
    if (typeof window !== 'undefined') {
      // Verificar si existe un token de autenticación
      const authToken = localStorage.getItem("authToken")
      
      if (authToken) {
        // Si hay un token, mostrar notificación y redirigir
        setNotificationMessage(t("auth.recoveringSession"))
        setShowNotification(true)
        
        // Redirigir después de un breve retraso para que la notificación sea visible
        setTimeout(() => {
          // NOTA: Aquí se podría agregar una verificación con el backend 
          // para validar que el token sea válido (pendiente para implementación futura)
          
          // También se podría determinar la redirección según el rol
          // Por ejemplo, verificando el contenido del token o llamando a un endpoint
          router.push("/")
        }, 1500) // Retraso de 1.5 segundos para que se vea la notificación
      }
      
      setIsChecking(false)
    }
  }, [router])

  // Renderizar la notificación si corresponde
  return (
    <NotificationToast
      message={notificationMessage}
      isVisible={showNotification}
      onClose={() => setShowNotification(false)}
    />
  )
}

export default AuthRedirect