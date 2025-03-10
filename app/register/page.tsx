import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-md">
        <RegisterForm />
      </div>
    </div>
  )
}

