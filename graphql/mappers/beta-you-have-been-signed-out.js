import clientQuery from '../client'

export async function getBetaPopupYouHaveBeenSignedOut() {
  const query = require('../queries/beta-you-have-been-signed-out.graphql')
  const res = await clientQuery(query)

  const content = res.data.schContentv1ByPath.item || {}
  const fallbackContent = {
    en: {
      scHeading: '',
      signOutLinkText: '',
      staySignedInLinktext: '',
      scContent: [],
    },
    fr: {
      scHeading: '',
      signOutLinkText: '',
      staySignedInLinktext: '',
      scContent: [],
    },
  }

  const mappedPopupYouHaveBeenSignedOut = {
    en: {
      scHeading: content.scHeadingEn,
      continueText: content.scFragments.filter(
        (fragment) => fragment.scId === 'continue'
      )[0].scLinkTextEn,
      scContent: content.scContentEn.json[0].content.map(
        (paragraph) => paragraph.value
      ),
    },
    fr: {
      scHeading: content.scHeadingFr,
      continueText: content.scFragments.filter(
        (fragment) => fragment.scId === 'continue'
      )[0].scLinkTextFr,
      scContent: content.scContentFr.json[0].content.map(
        (paragraph) => paragraph.value
      ),
    },
  }
  return mappedPopupYouHaveBeenSignedOut
}
