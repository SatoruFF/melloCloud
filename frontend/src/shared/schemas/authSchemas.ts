import { z } from "zod";

/**
 * Auth validation schemas. Use i18n keys as messages so components can pass t() when mapping errors.
 */

const emailSchema = z
  .string()
  .min(1, "auth.email-warning")
  .email("auth.email-invalid");

const passwordSchema = z
  .string()
  .min(1, "auth.password-warning")
  .min(6, "auth.password-min-length");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "auth.password-warning"),
});

export const registerSchema = z.object({
  userName: z
    .string()
    .min(1, "auth.nickname-warning")
    .min(2, "auth.nickname-min-length")
    .max(64, "auth.nickname-max-length"),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
