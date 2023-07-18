import { z } from "zod"



export const email = z
  .string()
  .email()
  .transform((str) => str.toLowerCase().trim())

export const password = z
  .string()
  .min(12)
  .max(64)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
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
export const Numbers = () => z.object({
  currentPassword: z.string(),
  newPassword: password,
})

export const description = z
  .string()
  .max(100)
  .transform((str) => str.trim())
  .optional()

export const Vendor = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters long.')
    .max(45)
    .transform((str) => str.trim())
    .refine((val) => val.trim().length > 0, {
      message: 'Field is required and cannot be empty.',
    }),
  code: z.string().max(45).transform((str) => str.trim()).refine((val) => val.trim().length > 0, {
    message: 'Field is required and cannot be empty.',
  }),
  gstin: z.string().max(45).transform((str) => str.trim()).optional(),
  creditPeriod: z.number().refine((val) => val !== 0, {
    message: 'Credit period is required.',
  }),
  leadTime: z.number().optional().nullable(),
  status: z.object({
    name: z.string()
  }, {
    invalid_type_error: "Please select an option from the dropdown.",
  }),
  vendorScore: z.number().optional().nullable(),

})

export const Product = z.object({
  name: z.string().min(3).max(45).transform((str) => str.trim()),
  description: z.string(),
  kit_products: z.unknown(),
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  color: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  gstTaxTypeCode: z.number().optional().nullable(),
  taxCalcType: z.string().optional().nullable(),
  category: z.object({
    id: z.number(),
    code: z.string(),
  }, {
    invalid_type_error: "Please select an option from the dropdown.",
  }),
  brand: z.object({
    id: z.number(),
    name: z.string(),
  }, {
    invalid_type_error: "Please select an option from the dropdown.",
  }).optional().nullable(),
  costPrice: z.number().optional(),
  sellingPrice: z.number().optional(),
  type: z.number(),
  kitProducts: z.array(z.object({
    product: z.object({
      name: z.string(),
      id: z.number(),
      description
    }, {
      invalid_type_error: "Product required"
    }),
    quantity: z.number()
  })).optional()
}).refine(input => {

  // allows kitProducts to be optional only type is 1
  if (input.type === 1) return false

  return true
})

const Number = z.number({
  invalid_type_error: "Required",
})
const String = z.string({
  invalid_type_error: "Required",
})
export const Package = z.object({
  length: Number,
  width: Number,
  height: Number,
  weight: Number,
})
export const CourierSelection = z.object({
  courierType: String,
  courier: String,
})
