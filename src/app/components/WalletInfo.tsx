'use client';

import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useEffect, useState } from 'react';

import { PYUSD_MINT } from '../admin/wallet';

interface WalletInfoProps {
  publicKey: PublicKey;
  isAdmin?: boolean;
}

export function WalletInfo({ publicKey, isAdmin }: WalletInfoProps) {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");

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
        
        const accountInfo = await connection.getAccountInfo(tokenAddress);
        if (accountInfo) {
          const tokenAccountBalance = await connection.getTokenAccountBalance(tokenAddress);
          setTokenBalance(Number(tokenAccountBalance.value.uiAmount));
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
  }, [publicKey]);

  return (
    <div className="flex items-center space-x-4">
      <h1 className="text-xl font-bold">{isAdmin ? 'Admin Wallet' : 'Your Wallet'}</h1>
      <div className="flex space-x-2">
        {solBalance !== null && (
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
            SOL: {solBalance.toFixed(4)}
          </span>
        )}
        {tokenBalance !== null && (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
            PYUSD: {tokenBalance.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
