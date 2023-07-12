import {useEffect, useMemo, useState} from "react";
import {AmbErrorProviderWeb3, Contracts} from "@airdao/airdao-node-contracts";
import {utils} from 'ethers';

const multisigFinanceAddresses = [
  '0x68c66f1C56CC6341856cf4427650978B653C78D6',
  '0xA9aFf50ABE9997EBe09834493cB675F8b13feB50',
  '0xAfaBC47C72440037Db5F5F6011Dc2ac34fc52Fa6',
  '0xC24b4c73dc9002c8aaBc3620965D727C29E0126F',
  '0xfaE424EA67c94a510f9230b551bfE13340d9cA15',
];

const formatString = (str) => {
  return `${str.substring(0, 4)}...${str.substring(str.length - 4, str.length)}`;
};

const provider = window.ethereum ? new AmbErrorProviderWeb3(window.ethereum) : null;

const App = () => {
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      init();
    }
  }, []);

  const init = async () => {
    const chainId = (await provider.getNetwork()).chainId;
    const {contracts, nameByAddress} = new Contracts(provider, chainId);

    const promises = multisigFinanceAddresses.map(async (el) => {
      const filter = contracts[nameByAddress[el]].filters.Withdraw();
      const balance = await provider.getBalance(el)

      return new Promise((resolve) => {
        contracts[nameByAddress[el]].queryFilter(filter)
          .then((response) => resolve({
            txs: response,
            multisigName: nameByAddress[el],
            balance: utils.formatEther(balance),
          }));
      })
    });

    Promise.all(promises)
      .then((res) => setTableData(res));
  };

  const handleMetamask = () => {
    window
      .open(
        `https://metamask.app.link/dapp/${
          window.location.hostname + window.location.pathname
        }`
      )
      .focus();
  };

  const maxTxsLength = useMemo(() => (
    tableData ? Math.max(...tableData.map((el) => el.txs.length)) : 0
  ), [tableData]);

  return !window.ethereum ? (
    <div>
      <p className="metamask-warning">
        You need to install Metamask to see this page
      </p>
      <button onClick={handleMetamask} className="metamask-install">
        Install Metamask
      </button>
    </div>
  ) : (
    tableData && (
      <div className="table">
        <div className="table__row">
          <div className="table__cell" />
          {tableData.map((el) => (
            <div key={el.multisigName} className="table__cell">
              {el.multisigName.replace('Finance', '')}
            </div>
          ))}
        </div>
        <div className="table__row">
          <div className="table__cell">Balance:</div>
          {tableData.map((el) => (
            <div key={el.multisigName} className="table__cell">
              {el.balance}
            </div>
          ))}
        </div>
        {Array(maxTxsLength).fill(0).map((_, i) => (
          <div key={i} className="table__row">
            <div className="table__cell">
              {i === 0 && <p>List of txs:</p>}
            </div>
            {tableData.map((el) => (
              <div key={el.multisigName} className="table__cell">
                {el.txs[i] && (
                  <>
                    <p>
                      Tx hash: {' '}
                      <a
                        href={`https://airdao.io/explorer/tx/${el.txs[i].transactionHash}`}
                        target="_blank" rel="noreferrer"
                      >
                        {formatString(el.txs[i].transactionHash)}
                      </a>
                    </p>
                    <p>Amount: {utils.formatEther(el.txs[i].args.amount).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,')} AMB</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  )
};

export default App;