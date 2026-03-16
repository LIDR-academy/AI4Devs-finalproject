import MagicAuthLayout from '@/components/auth/MagicAuthLayout'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <MagicAuthLayout
      title="Set New Password"
      subtitle="Create a new password for your account"
    >
      <ResetPasswordForm />
    </MagicAuthLayout>
  )
}
