import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { supabase } from '@/lib/supabase'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<{ new?: string; confirm?: string }>({})
  const [formError, setFormError] = useState('')

  const validate = () => {
    const errors: { new?: string; confirm?: string } = {}
    if (newPassword.length < 8) {
      errors.new = 'Password must be at least 8 characters.'
    }
    if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match.'
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFieldError({})

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldError(errors)
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setIsSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    navigate('/login', {
      replace: true,
      state: { successMessage: 'Password updated successfully. Please log in.' },
    })
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FFFDF9] font-['Inter'] lg:flex">
      {/* Left panel — orange brand area */}
      <div className="hidden lg:block lg:w-[55%] relative bg-[#FA8D40]">
        <div className="absolute top-[20%] left-[8%] right-[8%] text-white">
          <h1 className="font-semibold mb-6 leading-tight max-w-[500px] text-[24px] xl:text-[36px]">
            Make Work Feel Lighter With Mogzu.
          </h1>
          <p className="leading-relaxed text-[16px] xl:text-[20px] max-w-[400px]">
            Plan well. Book quick. Enjoy more.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:absolute lg:right-0 lg:top-0 lg:w-[45%] h-full flex items-center justify-center py-8 lg:py-0">
        <div className="w-full max-w-[500px] px-6 sm:px-8 md:px-12 lg:px-8">
          <div className="mb-5 lg:mb-6">
            <p className="text-[12px] text-black mb-2">Welcome to</p>
            <MogzuLogo className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[240px]" />
          </div>

          <h2 className="mb-1 text-[18px] font-semibold text-[#0e1e3f]">Set new password</h2>
          <p className="mb-6 text-[12px] text-[#878e9e]">
            Enter and confirm your new password below.
          </p>

          {formError && (
            <div className="mb-3 p-2.5 rounded-md border border-[#dde2e4] bg-[#f9f9f9]">
              <p className="text-[11px] text-[#0e1e3f]">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label htmlFor="new-password" className="block text-[11px] text-[#0e1e3f]">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
              {fieldError.new && (
                <p className="text-[10px] text-red-500">{fieldError.new}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="block text-[11px] text-[#0e1e3f]">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-[40px] px-3 py-2 bg-white border border-[#dde2e4] rounded-md shadow-sm text-[12px] text-black placeholder:text-[#878e9e] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
              {fieldError.confirm && (
                <p className="text-[10px] text-red-500">{fieldError.confirm}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-md bg-[#FA8D40] text-white text-[13px] font-medium hover:bg-[#e87d30] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-[#878e9e]">
            Remember your password?{' '}
            <Link to="/login" className="text-[#FA8D40] hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
