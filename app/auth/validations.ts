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
  description,
  kit_products: z.unknown(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  hsnCode: z.string().optional(),
  imageUrl: z.string().optional(),
  gstTaxTypeCode: z.string().optional(),
  taxCalcType: z.string().optional(),
  category: z.object({
    id: z.number(),
    code: z.string(),
  }, {
    invalid_type_error: "Please select an option from the dropdown.",
  }),
  brand: z.number().optional(),
  costPrice: z.number(),
  type: z.number(),
  kitProducts: z.array(z.object({
    product: z.object({
      name: z.string(),
      id: z.number(),
      description
    }),
    quantity: z.number()
  }))
})
