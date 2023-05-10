import '../styles/globals.css'
import Layout from '../components/Layout'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { useEffect } from 'react'
config.autoAddCss = false

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    let domReady = (cb) => {
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
        ? cb()
        : document.addEventListener('DOMContentLoaded', cb)
    }

    domReady(() => {
      // Display body when DOM is loaded
      document.body.style.visibility = 'visible'
    })
  }),
    []

  /* istanbul ignore next */
  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }

  const display = { hideBanner: pageProps.hideBanner }
  /* istanbul ignore next */
  return (
    <Layout
      locale={pageProps.locale}
      meta={pageProps.meta}
      langToggleLink={pageProps.langToggleLink}
      breadCrumbItems={pageProps.breadCrumbItems}
      bannerContent={pageProps.bannerContent}
      popupContent={pageProps.popupContent}
      display={display}
    >
      <Component {...pageProps} />
    </Layout>
  )
}
