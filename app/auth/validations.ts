import { z } from "zod"

export const email = z
  .string()
  .email()
  .transform((str) => str.toLowerCase().trim())

export const password = z
  .string()
  .min(10)
  .max(100)
  .transform((str) => str.trim())

export const Signup = z.object({
  email,
  password,
})

export const Login = z.object({
  email,
  password: z.string(),
})

export const ForgotPassword = z.object({
  email,
})

export const ResetPassword = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"], // set the path of the error
  })

export const ChangePassword = z.object({
  currentPassword: z.string(),
  newPassword: password,
})

export const description = z
  .string()
  .max(100)
  .transform((str) => str.trim())
  .optional()

export const Product = z.object({
  name: z.string().min(3).max(45).transform((str) => str.trim()),
  description: z.string().optional().nullable(),
  kit_products: z.unknown(),
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  color: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  gstTaxTypeCode: z.string().optional().nullable(),
  taxCalcType: z.string().optional().nullable(),
  category: z.object({
    id: z.number(),
    code: z.string(),
  }, {
    invalid_type_error: "Please select an option from the dropdown.",
  }),
  brand: z.number().optional().nullable(),
  costPrice: z.number(),
  type: z.number(),
  kitProducts: z.array(z.object({
    product: z.object({
      name: z.string(),
      id: z.number(),
      description
    }),
    quantity: z.number()
  })).optional()
}).refine(input => {

  // allows kitProducts to be optional only type is 1
  if (input.type === 1) return false

  return true
})
