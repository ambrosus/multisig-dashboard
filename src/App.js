import { utils } from 'ethers';
import useTableData from './useTableData';
import chevronArrow from './assets/chevron-arrow.svg';

import { Menu } from 'airdao-components-and-tools/components';
import {
  metamaskConnector,
  walletconnectConnector,
} from 'airdao-components-and-tools/utils';
import { useAutoLogin } from 'airdao-components-and-tools/hooks';

const App = () => {
  useAutoLogin();
  const { tableData, maxTxsLength } = useTableData();

  return (
    tableData && (
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
              <div className='sort-by'>
                <h3 className='sort-by__heading'>Sort by:</h3>
                <button className='sort-by__button'>
                  Time
                  <img
                    src={chevronArrow}
                    className='sort-by__arrow'
                    alt={'arrow'}
                  />
                </button>
                <button className='sort-by__button'>
                  Balance
                  <img
                    src={chevronArrow}
                    className='sort-by__arrow'
                    alt={'arrow'}
                  />
                </button>
              </div>
            </div>
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
                        <div className='cell-title'>Tx hash</div>
                        <div className='cell-title'>Amount</div>
                      </div>
                      {tableData.map((el) => (
                        <div key={el.multisigName} className='table__cell'>
                          {el.txs[i] && (
                            <>
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
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </main>
      </>
    )
  );
};

const formatString = (str) => {
  return `${str.substring(0, 4)}...${str.substring(
    str.length - 4,
    str.length
  )}`;
};

export default App;
