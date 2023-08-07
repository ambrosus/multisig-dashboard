import { useSinglePrismicDocument } from '@prismicio/react';

export default function useTxComments() {
  const [document, meta] = useSinglePrismicDocument('dashboard');

  return meta.state === 'loaded'
    ? document.data.transaction_comments.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {})
    : {};
}
