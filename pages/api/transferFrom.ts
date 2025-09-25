import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getDefaultStore } from 'jotai/vanilla';
import { destinationSettingsAtom } from '../../src/atoms/destination-settings-atom';

const erc20Abi = [
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { tokenAddress, from, to, amount } = req.body;
    if (!tokenAddress || !from || !to || !amount) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Get private key from jotai store (works only in-memory/serverless, not persistent)
    const store = getDefaultStore();
    const { privateKey } = store.get(destinationSettingsAtom);

    if (!privateKey) {
      return res.status(400).json({ error: 'Private key not set' });
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(tokenAddress, erc20Abi, wallet);

    const tx = await contract.transferFrom(from, to, amount);
    await tx.wait();

    return res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}