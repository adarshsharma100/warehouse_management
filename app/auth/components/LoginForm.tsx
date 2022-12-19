import { AuthenticationError, PromiseReturnType } from "blitz"
import Link from "next/link"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import login from "app/auth/mutations/login"
import { Login } from "app/auth/validations"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { InputText } from "primereact/inputtext"
import { Checkbox } from "primereact/checkbox"
import { Button } from "primereact/button"
type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  return (
    <Form
      // className="flex justify-content-center flex-column"
      schema={Login}
      initialValues={{ email: "", password: "" }}
      onSubmit={async (values) => {
        console.log("values:123 ", values)
        try {
          const user = await loginMutation(values)
          props.onSuccess?.(user)
        } catch (error: any) {
          if (error instanceof AuthenticationError) {
            return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
          } else {
            return {
              [FORM_ERROR]:
                "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
            }
          }
        }
      }}
    >
      {/* <div className="text-center text-900 text-5xl font-medium mb-3">Smart Factory</div> */}
      {/* <div className="text-center text-900 text-3xl font-medium mb-3">Welcome Back</div> */}
      <div className="max-w-30rem" style={{ margin: "0 auto" }}>
        <LabeledTextField
          type="email"
          name="email"
          label="Email"
          placeholder="Email"
          className="w-full"
        />
        <LabeledTextField
          className="w-full"
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
        />
        <div className="flex align-items-center justify-content-between mb-6">
          {/* <div className="flex align-items-center">
            <Checkbox inputId="rememberme1" className="mr-2" />
            <label htmlFor="rememberme1">Remember me</label>
          </div> */}
          <Link href={Routes.ForgotPasswordPage()}>
            <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
              Forgot password?
            </a>
          </Link>
        </div>

        <Button type="submit" label="Sign In" icon="pi pi-user" className="w-full" />
      </div>
      {/* <div style={{ marginTop: "1rem" }}>
        Or{" "}
        <Link href={Routes.SignupPage()}>
          <a>Sign Up</a>
        </Link>
      </div> */}
    </Form>
  )
}

export default LoginForm
