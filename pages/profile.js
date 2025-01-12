import PropTypes from 'prop-types'
import Heading from '../components/Heading'
import PageLink from '../components/PageLink'
import en from '../locales/en'
import fr from '../locales/fr'
import { getProfileContent } from '../graphql/mappers/profile'
import { getBetaBannerContent } from '../graphql/mappers/beta-banner-opt-out'
import { getBetaPopupExitContent } from '../graphql/mappers/beta-popup-exit'
import { getBetaPopupNotAvailableContent } from '../graphql/mappers/beta-popup-page-not-available'
import { getAuthModalsContent } from '../graphql/mappers/auth-modals'
import { getLogger } from '../logging/log-util'
import { AuthIsDisabled, AuthIsValid, Redirect } from '../lib/auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import ProfileTasks from './../components/ProfileTasks'
import React from 'react'
import { useEffect, useCallback, useMemo, useState } from 'react'
import throttle from 'lodash.throttle'
import { acronym } from '../lib/acronym'
import ErrorPage from '../components/ErrorPage'
import { useRouter } from 'next/router'

export default function Profile(props) {
  /* istanbul ignore next */
  const t = props.locale === 'en' ? en : fr
  const [response, setResponse] = useState()
  const router = useRouter()

  //Event listener for click events that revalidates MSCA session, throttled using lodash to only trigger every 1 minute
  const onClickEvent = useCallback(
    async () => setResponse(await fetch('/api/refresh-msca')),
    []
  )
  const throttledOnClickEvent = useMemo(
    () => throttle(onClickEvent, 60000, { trailing: false }),
    [onClickEvent]
  )

  useEffect(() => {
    window.addEventListener('click', throttledOnClickEvent)
    //If validateSession call indicates an invalid MSCA session, redirect to logout
    if (response?.status === 401) {
      router.push(`/${props.locale}/auth/logout`)
    }
    //Remove event on unmount to prevent a memory leak with the cleanup
    return () => {
      window.removeEventListener('click', throttledOnClickEvent)
    }
  }, [throttledOnClickEvent, response, router, props.locale])

  const errorCode =
    props.content?.err ||
    props.bannerContent?.err ||
    props.popupContent?.err ||
    props.popupContentNA?.err ||
    props.authModals?.err
  if (errorCode !== undefined) {
    return (
      <ErrorPage
        lang={props.locale !== undefined ? props.locale : 'en'}
        errType={errorCode}
        isAuth={false}
        homePageLink={
          props.locale === 'en'
            ? 'en/privacy-notice-terms-conditions'
            : 'fr/avis-confidentialite-modalites'
        }
        accountPageLink={
          props?.locale === 'en'
            ? 'https://srv136.services.gc.ca/sc/msca-mdsc/portal-portail/pro/home-accueil?Lang=eng'
            : 'https://srv136.services.gc.ca/sc/msca-mdsc/portal-portail/pro/home-accueil?Lang=fra'
        }
      />
    )
  }

  return (
    <div id="homeContent" data-testid="profileContent-test">
      <Heading id="profile-heading" title={props.content.pageName} />
      <p className="text-lg text-gray-darker mt-2">{props.content.heading}</p>
      <div data-cy="profile-lists">
        {props.content.list.map((program, index) => {
          return (
            <ProfileTasks
              key={index}
              acronym={acronym(program.title)}
              programTitle={program.title}
              tasks={program.tasks}
              data-testid="profile-task-group-list"
              openModal={props.openModal}
              data-cy="task"
              refPageAA={props.aaPrefix}
            />
          )
        })}
      </div>

      <PageLink
        lookingForText={props.content.lookingFor.title}
        accessText={props.content.lookingFor.subText[0]}
        linkText={props.content.lookingFor.subText[1]}
        href={props.content.lookingFor.link}
        dataCy="access-security-page-link"
        buttonHref={props.content.backToDashboard.btnLink}
        buttonId="back-to-dashboard-button"
        buttonLinkText={props.content.backToDashboard.btnText}
        refPageAA={props.aaPrefix}
        dashId={t.id_dashboard}
      ></PageLink>
    </div>
  )
}

export async function getServerSideProps({ req, res, locale }) {
  const session = await getServerSession(req, res, authOptions)

  if (!AuthIsDisabled() && !(await AuthIsValid(req, session)))
    return Redirect(locale)

  //The below sets the minimum logging level to error and surpresses everything below that
  const logger = getLogger('profile')
  logger.level = 'error'

  const content = await getProfileContent().catch((error) => {
    logger.error(error)
    return { err: '500' }
  })
  const bannerContent = await getBetaBannerContent().catch((error) => {
    logger.error(error)
    return { err: '500' }
  })
  const popupContent = await getBetaPopupExitContent().catch((error) => {
    logger.error(error)
    return { err: '500' }
  })

  /*
   * Uncomment this block to make Banner Popup Content display "Page Not Available"
   * Comment "getBetaPopupExitContent()" block of code above.
   */
  const popupContentNA = await getBetaPopupNotAvailableContent().catch(
    (error) => {
      logger.error(error)
      return { err: '500' }
    }
  )

  const authModals = await getAuthModalsContent().catch((error) => {
    logger.error(error)
    return { err: '500' }
  })

  /* istanbul ignore next */
  const langToggleLink = locale === 'en' ? '/fr/profil' : '/en/profile'

  const t = locale === 'en' ? en : fr

  const breadCrumbItems =
    locale === 'en'
      ? content.en.breadcrumb?.map(({ link, text }) => {
          return { text, link: '/' + locale + '/' + link }
        })
      : content.fr.breadcrumb?.map(({ link, text }) => {
          return { text, link: '/' + locale + '/' + link }
        })

  /* Place-holder Meta Data Props */
  const meta = {
    data_en: {
      title: 'Profile - My Service Canada Account',
      desc: 'English',
      author: 'Service Canada',
      keywords: '',
      service: 'ESDC-EDSC_MSCA-MSDC-SCH',
      creator: 'Employment and Social Development Canada',
      accessRights: '1',
    },
    data_fr: {
      title: 'Profil - Mon dossier Service Canada',
      desc: 'Français',
      author: 'Service Canada',
      keywords: '',
      service: 'ESDC-EDSC_MSCA-MSDC-SCH',
      creator: 'Emploi et Développement social Canada',
      accessRights: '1',
    },
  }

  return {
    props: {
      locale,
      langToggleLink,
      content:
        content?.err !== undefined
          ? content
          : locale === 'en'
          ? content.en
          : content.fr,
      meta,
      breadCrumbItems,
      bannerContent:
        bannerContent?.err !== undefined
          ? bannerContent
          : locale === 'en'
          ? bannerContent.en
          : bannerContent.fr,
      popupContent:
        popupContent?.err !== undefined
          ? popupContent
          : locale === 'en'
          ? popupContent.en
          : popupContent.fr,
      popupContentNA:
        popupContentNA?.err !== undefined
          ? popupContentNA
          : locale === 'en'
          ? popupContentNA.en
          : popupContentNA.fr,
      aaPrefix:
        content?.err !== undefined
          ? ''
          : `ESDC-EDSC:${content.en?.heading || content.en?.title}`,
      popupStaySignedIn:
        authModals?.err !== undefined
          ? authModals
          : locale === 'en'
          ? authModals.mappedPopupStaySignedIn.en
          : authModals.mappedPopupStaySignedIn.fr,
      popupYouHaveBeenSignedout:
        authModals?.err !== undefined
          ? authModals
          : locale === 'en'
          ? authModals.mappedPopupSignedOut.en
          : authModals.mappedPopupSignedOut.fr,
    },
  }
}

Profile.propTypes = {
  /**
   * current locale in the address
   */
  locale: PropTypes.string,

  /*
   * Meta Tags
   */
  meta: PropTypes.object,
}
