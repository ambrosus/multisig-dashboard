import { useEffect, useMemo, useState } from 'react';
import { Contracts, Multisig } from '@airdao/airdao-node-contracts';
import provider from '../services/provider';
import {BigNumber, utils} from 'ethers';
import tableDataMock from '../utils/tableDataMock.json';

const masterMultisig = '0x68c66f1C56CC6341856cf4427650978B653C78D6';

const multisigFinanceAddresses = [
  masterMultisig,
  '0xA9aFf50ABE9997EBe09834493cB675F8b13feB50',
  '0xAfaBC47C72440037Db5F5F6011Dc2ac34fc52Fa6',
  '0xC24b4c73dc9002c8aaBc3620965D727C29E0126F',
  '0xfaE424EA67c94a510f9230b551bfE13340d9cA15',
];

export default function useTableData(
  sorting = { param: 'time', direction: 'descending' },
  filterBy = 'all'
) {
  const [tableData, setTableData] = useState(tableDataMock);
  const [filteredList, setFilteredList] = useState(tableDataMock);

  useEffect(() => {
    getTableData();
  }, []);

  useEffect(() => {
    if (tableData) {
      const sortedWalletsData = tableData.map((wallet) => {
        return {
          ...wallet,
          txs: filterTxs(wallet.txs, filterBy).sort(
            sortingFunctions[sorting.param][sorting.direction]
          ),
        };
      });
      setFilteredList(sortedWalletsData);
    }
  }, [sorting, filterBy]);

  const getTableData = async () => {
    const chainId = 16718;
    const contractsData = new Contracts(provider, chainId);

    const { contracts, nameByAddress } = contractsData;

    const walletsData = await Promise.all(multisigFinanceAddresses.map(async (el) => {
      const filter = contracts[nameByAddress[el]].filters.Withdraw();

      let balance = 0;
      if (el === masterMultisig) {
        await Multisig.getMasterFinanceBalances(contractsData).then(
          (response) => {
            balance = response.reduce(
              (accumulator, { balance }) => accumulator.add(balance),
              utils.parseEther('0')
            );
          }
        );
      } else {
        balance = await Multisig.getFinanceBalance(contractsData, nameByAddress[el]);
      }

      const filteredData = await contracts[nameByAddress[el]].queryFilter(filter);
      const txs = await Promise.all(filteredData.map(async (tx) => {
        const { timestamp } = await tx.getBlock();
        return { ...tx, timestamp, isOutcome: true, amount: tx.args.amount }
      }));

      const explorerData = await getExplorerData(el);

      return({
        txs: [...txs, ...explorerData],
        multisigName: nameByAddress[el],
        balance: utils.formatEther(balance),
      });
    }));

    const sortedWalletsData = walletsData.map((wallet) => {
      return {
        ...wallet,
        txs: wallet.txs.sort(
          sortingFunctions[sorting.param][sorting.direction]
        ),
      };
    });
    setTableData(sortedWalletsData);
    setFilteredList(sortedWalletsData)
  };

  const maxTxsLength = useMemo(
    () => (filteredList ? Math.max(...filteredList.map((el) => el.txs.length)) : 0),
    [filteredList, filterBy]
  );

  return { tableData: filteredList, maxTxsLength };
}

async function getExplorerData (address) {
  let hasNext = true;
  let page = 1;
  const formattedExplorerData = [];

  while (hasNext) {
    const response = await fetch(`https://explorer-v2-api.ambrosus.io/v2/addresses/${address}/transfers?page=${page}`);
    const { data, pagination } = await response.json();

    page = pagination.current;
    hasNext = pagination.hasNext;

    data.forEach((el) => {
      if (el.status === 'SUCCESS') {
        formattedExplorerData.push({
          transactionHash: el.hash,
          timestamp: el.timestamp,
          amount: BigNumber.from(el.value.wei),
        })
      }
    });
  }
  return formattedExplorerData;
}

const filterTxs = (txs, filter) => {
  if (filter === 'all') return txs;
  return txs.filter((el) => {
    if (filter === 'out') {
      return el.isOutcome;
    } else if (filter === 'in') {
      return !el.isOutcome;
    }
  });
};

const sortingFunctions = {
  time: {
    ascending: (a, b) => {
      return b.timestamp - a.timestamp;
    },
    descending: (a, b) => {
      return a.timestamp - b.timestamp;
    },
  },
  amount: {
    ascending: ( { amount: a }, { amount: b }) => {
      if (a.lt(b)) {
        return 1;
      }
      if (a.gt(b)) {
        return -1;
      }
      if (a.eq(b)) {
        return 0;
      }
    },
    descending: ({ amount: a }, { amount: b }) => {
      if (a.lt(b)) {
        return -1;
      }
      if (a.gt(b)) {
        return 1;
      }
      if (a.eq(b)) {
        return 0;
      }
    },
  },
};
