import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@dts-stn/service-canada-design-system'
import PropTypes from 'prop-types'
import Link from 'next/link'

export default function ExitBetaModal(props) {
  return (
    <div
      className="m-8 sm:mx-24 sm:mt-24 p-4 md:p-16 bg-white rounded h-fit"
      data-cy="exitBetaModal"
      id={props.popupId}
    >
      <div className="flex justify-between">
        <div
          className="text-3xl font-display font-bold"
          role="heading"
          aria-level="1"
        >
          {props.popupTitle}
        </div>
        <button
          data-cy="x-button"
          type="button"
          aria-label={props.closeModalAria}
          onClick={props.closeModal}
        >
          <FontAwesomeIcon aria-hidden="true" icon={solid('xmark')} size="xl" />
        </button>
      </div>
      <p className="text-xl font-display py-4 mr-10">
        {props.popupDescription}
      </p>
      <div className="md:flex mt-8 md:space-x-12 space-y-6 md:space-y-0">
        <Button
          className="w-full block md:w-fit"
          id={props.popupSecondaryBtn.id}
          styling="secondary"
          onClick={props.closeModal}
          text={props.popupSecondaryBtn.text}
        />
        <Link href={props.continueLink}>
          <Button
            className="w-full block md:w-fit"
            id={props.popupPrimaryBtn.id}
            styling="primary"
            text={props.popupPrimaryBtn.text}
          />
        </Link>
      </div>
    </div>
  )
}

ExitBetaModal.propTypes = {
  /**
   * Function used to control closing the modal for X icon and secondary button
   */
  closeModal: PropTypes.func,

  /*
   * Area label for X icon in top right of modal
   */
  closeModalAria: PropTypes.string,

  /*
   * Link for page to continue on with after modal confirmation
   */
  continueLink: PropTypes.string,

  /*
   * Popup id
   */
  popupId: PropTypes.string,

  /*
   * Popup Title
   */
  popupTitle: PropTypes.string,

  /*
   * Popup Text
   */
  popupDescription: PropTypes.string,

  /*
   * Popup Primary Button
   */
  popupPrimaryBtn: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }),

  /*
   * Popup Secondary Button
   */
  popupSecondaryBtn: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }),
}
