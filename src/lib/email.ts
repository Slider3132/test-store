import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { envValue, isProduction } from '@/lib/env'

const requiredSMTPInProduction = (name: string) => {
  const value = envValue(name)

  if (isProduction && (!value || value.length === 0)) {
    throw new Error(`Missing required production SMTP environment variable: ${name}`)
  }

  return value
}

const smtpHost = requiredSMTPInProduction('SMTP_HOST')
const smtpPort = requiredSMTPInProduction('SMTP_PORT')
const smtpUser = requiredSMTPInProduction('SMTP_USER')
const smtpPass = requiredSMTPInProduction('SMTP_PASS')
const emailFromAddress = requiredSMTPInProduction('EMAIL_FROM_ADDRESS')
const emailFromName = envValue('EMAIL_FROM_NAME') || 'Payload Commerce'

export const hasSMTPEmailEnv = Boolean(
  smtpHost && smtpPort && smtpUser && smtpPass && emailFromAddress,
)

export const getEmailAdapter = () => {
  if (!hasSMTPEmailEnv) return undefined

  return nodemailerAdapter({
    defaultFromAddress: emailFromAddress!,
    defaultFromName: emailFromName,
    skipVerify: envValue('SMTP_SKIP_VERIFY') === 'true',
    transportOptions: {
      auth: {
        pass: smtpPass!,
        user: smtpUser!,
      },
      host: smtpHost!,
      port: Number(smtpPort),
      secure: envValue('SMTP_SECURE') === 'true',
    },
  })
}
