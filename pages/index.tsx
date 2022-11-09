import React from "react"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import logo from "public/logo.png"
import { useMutation } from "@blitzjs/rpc"
import { Routes, BlitzPage } from "@blitzjs/next"
import { InputText } from "primereact/inputtext"
import { Checkbox } from "primereact/checkbox"
import loginImage from "../Assets/Images/login.jpg"
import { Button } from "primereact/button"
import LoginForm from "app/auth/components/LoginForm"
import { useRouter } from "next/router"
/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

// const UserInfo = () => {
//   const currentUser = useCurrentUser()
//   const [logoutMutation] = useMutation(logout)

//   if (currentUser) {
//     // return (
//     //   <>
//     //     <button
//     //       className="button small"
//     //       onClick={async () => {
//     //         await logoutMutation()
//     //       }}
//     //     >
//     //       Logout
//     //     </button>
//     //     <div>
//     //       User id: <code>{currentUser.id}</code>
//     //       <br />
//     //       User role: <code>{currentUser.role}</code>
//     //     </div>
//     //   </>
//     // )
//   } else {
//     return (
//         <>
//           <Link href={Routes.SignupPage()}>
//             <a className="button small">
//               <strong>Sign Up</strong>
//             </a>
//           </Link>
//           <Link href={Routes.LoginPage()}>
//             <a className="button small">
//               <strong>Login</strong>
//             </a>
//           </Link>
//         </>
//     )
//   }
// }

const Home: BlitzPage = () => {
  // Home.authenticate = true
  const router = useRouter()

  return (
    <div className="grid h-screen m-0 login">
      <div className="login-image  hidden md:inline-flex col-12 md:col-6 lg:col-8 m-0" />

      <div className="col-12 md:col-6 lg:col-4 flex-column flex justify-content-center align-items-center">
        {[...Array(30).keys()].map((data, index) => (
          <div key={index} className="firefly" />
        ))}
        <LoginForm
          onSuccess={(_user) => {
            const next = router.query.next
              ? decodeURIComponent(router.query.next as string)
              : "/vendors"
            return router.push(next)
          }}
        />
      </div>
    </div>
  )
}

export default Home
