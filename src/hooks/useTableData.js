import { useEffect, useMemo, useState } from 'react';
import { Contracts, Multisig } from '@airdao/airdao-node-contracts';
import provider from '../services/provider';
import { utils } from 'ethers';
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
  sorting = { param: 'time', direction: 'descending' }
) {
  const [tableData, setTableData] = useState(tableDataMock);

  useEffect(() => {
    getTableData();
  }, []);

  useEffect(() => {
    if (tableData) {
      const sortedWalletsData = tableData.map((wallet) => {
        return {
          ...wallet,
          txs: wallet.txs.sort(
            sortingFunctions[sorting.param][sorting.direction]
          ),
        };
      });
      setTableData(sortedWalletsData);
    }
  }, [sorting]);

  const getTableData = async () => {
    const chainId = 16718;

    const contractsData = new Contracts(provider, chainId);
    const { contracts, nameByAddress } = contractsData;

    const promises = multisigFinanceAddresses.map(async (el) => {
      const filter = contracts[nameByAddress[el]].filters.Withdraw();
      let balance;

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
        balance = 0;
      }

      return new Promise((resolve) => {
        contracts[nameByAddress[el]].queryFilter(filter).then(async (response) => {
          const txs = await Promise.all(response.map(async (tx) => {
            const { timestamp } = await tx.getBlock();
            return { ...tx, timestamp }
          }));

          resolve({
            txs,
            multisigName: nameByAddress[el],
            balance: utils.formatEther(balance),
          });
        });
      });
    });
    const walletsData = await Promise.all(promises);
    const sortedWalletsData = walletsData.map((wallet) => {
      return {
        ...wallet,
        txs: wallet.txs.sort(
          sortingFunctions[sorting.param][sorting.direction]
        ),
      };
    });
    setTableData(sortedWalletsData);
  };

  const maxTxsLength = useMemo(
    () => (tableData ? Math.max(...tableData.map((el) => el.txs.length)) : 0),
    [tableData]
  );

  return { tableData, maxTxsLength };
}

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
    ascending: ({ args: { amount: a } }, { args: { amount: b } }) => {
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
    descending: ({ args: { amount: a } }, { args: { amount: b } }) => {
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
