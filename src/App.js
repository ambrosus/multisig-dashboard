import { utils } from 'ethers';
import useTableData from './hooks/useTableData';

import { Menu } from 'airdao-components-and-tools/components';
import {
  metamaskConnector,
  walletconnectConnector,
} from 'airdao-components-and-tools/utils';
import { useAutoLogin } from 'airdao-components-and-tools/hooks';
import SortBy from './components/SortBy';
import { useState } from 'react';
import useTxComments from './hooks/useTxComments';
import CommentIcon from './assets/CommentIcon.';
import CommentModal from './components/CommentModal';

const App = () => {
  useAutoLogin();
  const [sortBy, setSortBy] = useState({
    param: 'time',
    direction: 'descending',
  });
  const { tableData, maxTxsLength } = useTableData(sortBy);

  const comments = useTxComments();

  const [currentComment, setCurrentComment] = useState(null);

  const setComment = (id) => {
    if (id === currentComment?.id) {
      setCurrentComment(null);
      return;
    }

    setCurrentComment(comments[id]);
  };

  return (
    <>
      <Menu
        metamaskConnector={metamaskConnector}
        walletconnectConnector={walletconnectConnector}
        initHidden
      />
      <main className='main'>
        <header className='header'>
          <h1 className='heading'>Wallet balance</h1>
          <p className='description'>
            Multisig wallet is a wallet for all company founds operations, see
            how it works on airdaowiki
          </p>
        </header>

        <section className='table-container'>
          <div className='table-header'>
            <h2 className='table-heading'>Transactions</h2>
            <SortBy onChange={setSortBy} />
          </div>
          {tableData && (
            <div className='scroll-container'>
              <div className='table'>
                <div className='wallet-balances'>
                  {tableData.map((wallet) => (
                    <div
                      key={wallet.multisigName}
                      className={`wallet-balance-card`}
                    >
                      <h4 className='wallet-name'>
                        {wallet.multisigName.replace('Finance', '')}
                      </h4>
                      <span className='wallet-balance'>
                        {(+wallet.balance)
                          .toFixed(2)
                          .replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,')}
                      </span>
                    </div>
                  ))}
                </div>
                {Array(maxTxsLength)
                  .fill(0)
                  .map((_, i) => (
                    <div className='table__row' key={i}>
                      <div className='table__cell table__cell_info'>
                        <div className='table__cell-data'>
                          <div className='cell-title'>Tx hash</div>
                          <div className='cell-title'>Amount</div>
                        </div>
                      </div>
                      {tableData.map((el) => (
                        <div key={el.multisigName} className='table__cell'>
                          {el.txs[i] && (
                            <>
                              <div className={'table__cell-data'}>
                                <a
                                  href={`https://airdao.io/explorer/tx/${el.txs[i].transactionHash}`}
                                  target='_blank'
                                  rel='noreferrer'
                                  className='tx-link'
                                >
                                  {formatString(el.txs[i].transactionHash)}
                                </a>
                                <p className='tx-amount'>
                                  {utils
                                    .formatEther(el.txs[i].args.amount)
                                    .replace(
                                      /(\d)(?=(\d{3})+([^\d]|$))/g,
                                      '$1,'
                                    )}{' '}
                                  AMB
                                </p>
                              </div>
                              {comments[el.txs[i].transactionHash] && (
                                <button
                                  className={`comment-button ${
                                    currentComment?.id ===
                                    el.txs[i].transactionHash
                                      ? 'comment-button_active'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    setComment(el.txs[i].transactionHash)
                                  }
                                >
                                  <CommentIcon />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <CommentModal {...currentComment} close={() => setCurrentComment(null)} />
    </>
  );
};

const formatString = (str) => {
  return `${str.substring(0, 4)}...${str.substring(
    str.length - 4,
    str.length
  )}`;
};

export default App;
