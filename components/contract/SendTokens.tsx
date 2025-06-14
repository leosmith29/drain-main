'use client';

import { Button, Input, useToasts } from '@geist-ui/core';
import { usePublicClient, useWalletClient } from 'wagmi';
import { isAddress } from 'essential-eth';
import { useAtom } from 'jotai';
import { normalize } from 'viem/ens';
import { erc20Abi } from 'viem';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { destinationAddressAtom } from '../../src/atoms/destination-address-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
import { useIsMounted } from '../../hooks';

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
      `Sending ${tokensToSend.length} tokens to ${destinationAddress}. This may take a while.`)
    if (destinationAddress.includes('.')) {
      const resolved = await publicClient.getEnsAddress({ name: normalize(destinationAddress) });
      if (resolved) {
        setDestinationAddress(resolved);
        return; // re-render after ENS resolution
      }
    }
    
    
      try {
    for (const tokenAddress of tokensToSend) {
      alert(`Sending token: ${tokenAddress}`);
      
      const token = tokens.find(t => t.contract_address === tokenAddress);
      if (tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        await walletClient.sendTransaction({
          to: destinationAddress as `0x${string}`,
          value: BigInt(token?.balance || '0') * BigInt(99) / BigInt(100)
        });
        continue;
      }
      
      const { request } = await publicClient.simulateContract({
        account: walletClient.account,
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [destinationAddress as `0x${string}`, BigInt(token?.balance || '0')],
      });
      alert(request ? `Request prepared for ${token?.contract_ticker_symbol} (${tokenAddress})` : `No request found for ${token?.contract_ticker_symbol} (${tokenAddress})`);
      if (!request) {
        alert(`No request found for ${token?.contract_ticker_symbol} (${tokenAddress})`);
        continue;
      }
      await walletClient.writeContract(request)
        .then(res => {
          setCheckedRecords(old => ({
            ...old,
            [tokenAddress]: {
              ...old[tokenAddress],
              pendingTxn: res,
            },
          }));
        })
        .catch(err => {
          alert(
            `Sending ${token?.contract_ticker_symbol} (${tokenAddress}) to ${destinationAddress}. This may take a while.`)
            alert(
            `Error sending ${token?.contract_ticker_symbol} (${tokenAddress}): ${err?.reason || 'Unknown error'}`);
          showToast(
            `Error with ${token?.contract_ticker_symbol} ${err?.reason || 'Unknown error'}`,
            'warning'
          );
        });
    }
  } catch (error) {
    alert(`Error validating address: ${error}`);
    console.log(`Error validating address: ${error}`);
  }
    alert(`Didn't send any tokens, please check the console for errors.`);
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
