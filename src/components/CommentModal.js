import { PrismicRichText } from '@prismicio/react';
import CloseIcon from '../assets/CloseIcon';
import PropTypes from 'prop-types';

export default function CommentModal({ id, comment, name, close }) {
  return (
    id && (
      <div className='comment-modal'>
        <div className='comment-modal__container'>
          <div className='comment-modal__content'>
            <PrismicRichText
              field={name}
              components={{
                heading4: ({ children }) => (
                  <h4 className='comment-modal__title'>{children}</h4>
                ),
              }}
            />
            <PrismicRichText
              field={comment}
              components={{
                paragraph: ({ children }) => (
                  <p className='comment-modal__text'>{children}</p>
                ),
              }}
            />
            <p className='comment-modal__tx-hash'>
              <span className='comment-modal__tx-hash-title'>Tx hash</span>
              {id}
            </p>
          </div>
          <CloseIcon className='comment-modal__close-icon' onClick={close} />
        </div>
      </div>
    )
  );
}

CommentModal.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.array,
  name: PropTypes.array,
  close: PropTypes.func,
};
