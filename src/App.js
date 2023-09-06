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
import formatAddress from './utils/formatString';
import TableHead from './components/TableHead';
import formatTimestamp from "./utils/formatTimestamp";
import FilterTxs from "./components/FilterTxs";

// TODO:
//   - add animation for comment modal
//   - add animation for comment button hover

const App = () => {
  useAutoLogin();
  const [sortBy, setSortBy] = useState({
    param: 'time',
    direction: 'ascending',
  });
  const [filterBy, setFilterBy] = useState('all');
  const { tableData, maxTxsLength } = useTableData(sortBy, filterBy);

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
          <h1 className='heading'>Governance multi-sig tracker</h1>
          <p className='description'>
            This multi-signature wallet holds all of AirDAO’s operational funds.
            Learn how it works with our wiki.
          </p>
        </header>
        <section className='table-container'>
          <div className='table-header'>
            <h2 className='table-heading'>Transactions</h2>
            <SortBy onChange={setSortBy} />
            <FilterTxs setFilterBy={setFilterBy}/>
          </div>
          {tableData && (
            <div className='scroll-container'>
              <div className='table'>
                <TableHead tableData={tableData} />
                {Array(maxTxsLength)
                  .fill(0)
                  .map((_, i) => (
                    <div className='table__row' key={i}>
                      <div className='table__cell table__cell_info'>
                        <div className='table__cell-data'>
                          <div className='cell-title'>Tx hash</div>
                          <div className='cell-title'>Amount</div>
                          <div className='cell-title'>Timestamp</div>
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
                                  {formatAddress(el.txs[i].transactionHash)}
                                </a>
                                <p className='tx-amount'>
                                  {el.txs[i].isOutcome  ? '↓' : <span className='arrow-green'>↑</span>}
                                  {' '}
                                  {utils
                                    .formatEther(el.txs[i].amount)
                                    .replace(
                                      /(\d)(?=(\d{3})+([^\d]|$))/g,
                                      '$1,'
                                    )}{' '}
                                  AMB
                                </p>
                                <p className='tx-amount tx-amount_timestamp'>
                                  {formatTimestamp(el.txs[i].timestamp)} UTC
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

export default App;
