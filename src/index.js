import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { Web3ReactProvider } from '@web3-react/core';

import { PrismicProvider } from '@prismicio/react';
import { client } from './prismic';

import {
  metamaskConnector,
  metamaskHooks,
  walletconnectConnector,
  walletconnectHooks,
} from 'airdao-components-and-tools/utils';

const connectors = [
  [metamaskConnector, metamaskHooks],
  [walletconnectConnector, walletconnectHooks],
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PrismicProvider client={client}>
    <Web3ReactProvider connectors={connectors}>
      <App />
    </Web3ReactProvider>
  </PrismicProvider>
);
