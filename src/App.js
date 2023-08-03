import { utils } from 'ethers';
import useTableData from './useTableData';
import chevronArrow from './assets/chevron-arrow.svg';

const App = () => {
  const { tableData, maxTxsLength } = useTableData();

  console.log(tableData);

  return (
    tableData && (
      <>
        <main className='main'>
          <header className='header'>
            <h1 className='heading'>Wallet balance</h1>
            <p className='description'>
              Multisig wallet is a wallet for all company founds operations,{' '}
              <br />
              see how it works on airdaowiki
            </p>
          </header>
          <section className='table-container'>
            <div className='table'>
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

              <div />
              {tableData.map((wallet, i) => (
                <div
                  key={wallet.multisigName}
                  className={`wallet-balance-card ${
                    i === 0 ? 'wallet-balance-card__first' : ''
                  }`}
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

              {Array(maxTxsLength)
                .fill(0)
                .map((_, i) => (
                  <>
                    <div className='table__cell'>
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
                  </>
                ))}
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
