import {useEffect, useMemo, useState} from "react";
import {AmbErrorProviderWeb3, Contracts, Multisig} from "@airdao/airdao-node-contracts";
import {utils, ethers} from 'ethers';

const masterMultisig = '0x68c66f1C56CC6341856cf4427650978B653C78D6'

const multisigFinanceAddresses = [
  masterMultisig,
  '0xA9aFf50ABE9997EBe09834493cB675F8b13feB50',
  '0xAfaBC47C72440037Db5F5F6011Dc2ac34fc52Fa6',
  '0xC24b4c73dc9002c8aaBc3620965D727C29E0126F',
  '0xfaE424EA67c94a510f9230b551bfE13340d9cA15',
];

async function getChainId() {
  // Check if MetaMask is installed
  if (window.ethereum) {
    await window.ethereum.enable(); // Request access to the user's accounts
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    console.log('Chain ID:', chainId);
    return chainId;
  } else {
    console.error('MetaMask not detected!');
  }
}

const formatString = (str) => {
  return `${str.substring(0, 4)}...${str.substring(str.length - 4, str.length)}`;
};
const provider = new ethers.providers.Web3Provider(window.ethereum);

const App = () => {
  const [isAmbNetwork, setIsAmbNetwork] = useState(null);
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      checkNetwork();
    }
  }, [])

  useEffect(() => {
    if (isAmbNetwork) {
      getTableData();
    }
  }, [isAmbNetwork]);

  const checkNetwork = async () => {
    const chainId = (await provider.getNetwork()).chainId;
    setIsAmbNetwork(chainId === 16718)
  };

  const changeNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x414E' }],
      })
        .then(() => window.location.reload())
    } catch (switchError) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x414E',
            chainName: 'AirDAO Mainnet',
            nativeCurrency: {
              name: "Amber",
              symbol: "AMB",
              decimals: 18
            },
            blockExplorerUrls: ["https://polygonscan.com/"],
            rpcUrls: ["https://network.ambrosus.io/"],
          },
        ],
      });
    }
  }

  const getTableData = async () => {
    const chainId = 16718;

    const contractsData = new Contracts(provider, chainId);
    const {contracts, nameByAddress} = contractsData;

    const promises = multisigFinanceAddresses.map(async (el) => {
      const filter = contracts[nameByAddress[el]].filters.Withdraw();
      let balance;

      if (el === masterMultisig) {
        await Multisig.getMasterFinanceBalances(contractsData)
          .then((response) => {
            balance = response.reduce(
              (accumulator, {balance}) => accumulator.add(balance),
              utils.parseEther('0')
            );
          })
      } else {
        balance = 0
      }

      return new Promise((resolve) => {
        contracts[nameByAddress[el]].queryFilter(filter)
          .then((response) => {
            console.log(11);
            resolve({
              txs: response,
              multisigName: nameByAddress[el],
              balance: utils.formatEther(balance),
            })
          })
          .catch(e=> console.log(e))
      })
    });
    console.log(4);
    await Promise.all(promises)
      .then((res) => setTableData(res))
      .catch((res) => {
        console.log(res);
      });
    console.log(5);
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
    <div className="metamask-block">
      <p className="metamask-warning">
        You need to install Metamask to see this page
      </p>
      <button onClick={handleMetamask} className="metamask-install">
        {window.innerWidth > 768 ? 'Install' : 'Open'} Metamask
      </button>
    </div>
  ) : (
    isAmbNetwork === false ? (
      <div className="metamask-block">
        <p className="metamask-warning">
          You need change metamask network to AirDAO
        </p>
        <button onClick={changeNetwork} className="metamask-install">
          Change network
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
                {(+el.balance).toFixed(2).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,')}
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
  )
};

export default App;