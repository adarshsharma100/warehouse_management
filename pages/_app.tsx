import { ErrorFallbackProps, ErrorComponent, ErrorBoundary, AppProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import React from "react"
import { withBlitz } from "app/blitz-client"
// import "primereact/resources/themes/lara-light-teal/theme.css"
// import "primereact/resources/themes/saga-purple/theme.css"
// import "primereact/resources/themes/lara-dark-indigo/theme.css"
import "../layout/layout.scss"
// import "primereact/resources/themes/arya-orange/theme.css"
import "primereact/resources/primereact.min.css" //core css
import "primeicons/primeicons.css"
import "/node_modules/primeflex/primeflex.css"

// import "primereact/resources/themes/bootstrap4-light-blue/theme.css"
// import "primereact/resources/themes/bootstrap4-light-purple/theme.css"
// import "primereact/resources/themes/bootstrap4-dark-blue/theme.css"
// import "primereact/resources/themes/bootstrap4-dark-purple/theme.css"
// import "primereact/resources/themes/md-light-indigo/theme.css"
// import "primereact/resources/themes/md-light-deeppurple/theme.css"
// // import "primereact/resources/themes/md-dark-indigo/theme.css"
// import "primereact/resources/themes/md-dark-deeppurple/theme.css"
// import "primereact/resources/themes/mdc-light-indigo/theme.css"
// import "primereact/resources/themes/mdc-light-deeppurple/theme.css"
// import "primereact/resources/themes/mdc-dark-indigo/theme.css"
// import "primereact/resources/themes/mdc-dark-deeppurple/theme.css"
// import "primereact/resources/themes/fluent-light/theme.css"
// import "primereact/resources/themes/lara-light-blue/theme.css"
// import "primereact/resources/themes/lara-light-indigo/theme.css"
// import "primereact/resources/themes/lara-light-purple/theme.css"
// import "primereact/resources/themes/lara-light-teal/theme.css"
// import "primereact/resources/themes/lara-dark-blue/theme.css"
import "primereact/resources/themes/lara-dark-indigo/theme.css"
// import "primereact/resources/themes/lara-dark-purple/theme.css"
// import "primereact/resources/themes/lara-dark-teal/theme.css"
// import "primereact/resources/themes/saga-blue/theme.css"
// import "primereact/resources/themes/saga-green/theme.css"
// import "primereact/resources/themes/saga-orange/theme.css"
// import "primereact/resources/themes/saga-purple/theme.css"
// import "primereact/resources/themes/vela-blue/theme.css"
// import "primereact/resources/themes/vela-green/theme.css"
// import "primereact/resources/themes/vela-orange/theme.css"
// import "primereact/resources/themes/vela-purple/theme.css"
// import "primereact/resources/themes/arya-blue/theme.css"
// import "primereact/resources/themes/arya-green/theme.css"
// import "primereact/resources/themes/arya-orange/theme.css"
// import "primereact/resources/themes/arya-purple/theme.css"
// import "primereact/resources/themes/nova/theme.css"
// import "primereact/resources/themes/nova-alt/theme.css"
// import "primereact/resources/themes/nova-accent/theme.css"
// import "primereact/resources/themes/luna-amber/theme.css"
// import "primereact/resources/themes/luna-blue/theme.css"
// import "primereact/resources/themes/luna-green/theme.css"
// import "primereact/resources/themes/luna-pink/theme.css"
// import "primereact/resources/themes/rhea/theme.css"

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      {getLayout(<Component {...pageProps} />)}
    </ErrorBoundary>
  )
}

export default withBlitz(MyApp)
