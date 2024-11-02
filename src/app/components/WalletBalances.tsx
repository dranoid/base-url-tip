'use client';

import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useEffect, useState } from 'react';

import { PYUSD_MINT } from '../admin/wallet';

interface WalletBalancesProps {
  publicKey: PublicKey;
  connection: Connection;
}

export function WalletBalances({ publicKey, connection }: WalletBalancesProps) {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [pyusdBalance, setPyusdBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        // Get SOL balance
        const solBalanceAmount = await connection.getBalance(publicKey);
        setSolBalance(solBalanceAmount / LAMPORTS_PER_SOL);

        // Get PYUSD balance
        const tokenAddress = getAssociatedTokenAddressSync(
          PYUSD_MINT,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        
        const tokenBalance = await connection.getTokenAccountBalance(tokenAddress);
        setPyusdBalance(Number(tokenBalance.value.uiAmount));
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
  }, [publicKey, connection]);

  return (
    <div className="flex space-x-4">
      <div className="px-4 py-2 bg-blue-100/10 text-blue-400 rounded-md">
        SOL: {solBalance?.toFixed(4) ?? '...'}
      </div>
      <div className="px-4 py-2 bg-green-100/10 text-green-400 rounded-md">
        PYUSD: {pyusdBalance?.toFixed(2) ?? '...'}
      </div>
    </div>
  );
}
