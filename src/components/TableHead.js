import PropTypes from 'prop-types';
import InlineLoader from './InlineLoader';

export default function TableHead({ tableData }) {
  return (
    <div className='wallet-balances'>
      {tableData.map((wallet) => (
        <HeadCell key={wallet.multisigName} {...wallet} />
      ))}
    </div>
  );
}

function HeadCell(wallet) {
  const name = wallet.multisigName.replace('Finance', '');
  const balance = (+wallet.balance)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,');

  return (
    <div className={`wallet-balance-card`}>
      <h4 className='wallet-name'>{name}</h4>
      <span className='wallet-balance'>
        {wallet.balance ? (
          balance
        ) : (
          <InlineLoader className={'wallet-balances__loader'} />
        )}
      </span>
    </div>
  );
}

TableHead.propTypes = {
  tableData: PropTypes.array,
};

HeadCell.propTypes = {
  wallet: PropTypes.object,
};
