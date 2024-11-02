'use client';

import { Connection, PublicKey } from '@solana/web3.js';

import { WalletBalances } from './WalletBalances';
import { createTransferTransaction } from './transaction';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface TipInterfaceProps {
  wallet: {
    publicKey: PublicKey;
    signTransaction: (transaction: any) => Promise<any>;
  };
  isAdmin?: boolean;
  initialCreatorAddress?: string;
}

export function TipInterface({ wallet, isAdmin = false, initialCreatorAddress }: TipInterfaceProps) {
  const [recipientAddress, setRecipientAddress] = useState(initialCreatorAddress || '');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { disconnect } = useWallet();
  
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!recipientAddress || !amount) {
        throw new Error('Please fill in all fields');
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      let recipientPubKey: PublicKey;
      try {
        recipientPubKey = new PublicKey(recipientAddress);
      } catch {
        throw new Error('Invalid recipient address');
      }

      const transaction = await createTransferTransaction(
        connection,
        wallet.publicKey,
        recipientPubKey,
        parseFloat(amount)
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = wallet.publicKey;

      let signedTx;
      if (isAdmin) {
        signedTx = transaction;
        await wallet.signTransaction(signedTx);
      } else {
        if (!window.solana) throw new Error("Phantom wallet not found");
        signedTx = await window.solana.signTransaction(transaction);
      }

      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 5
      });

      const confirmation = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      setRecipientAddress('');
      setAmount('');
      setSuccess(`Transaction successful! Signature: ${signature}`);
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to send tip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text animate-gradient">
          {isAdmin ? 'Admin Tip Interface' : 'Tip Interface'}
        </h2>
        <div className="flex items-center gap-4">
          <WalletBalances publicKey={wallet.publicKey} connection={connection} />
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300 hover:scale-105"
          >
            Disconnect
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 rounded-2xl p-8 backdrop-blur-lg border border-white/10 animate-slideUp">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Creator's PYUSD Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-purple-500 text-white transition-all duration-300 hover:bg-white/10"
            placeholder="Enter creator's Solana address"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Amount (PYUSD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-purple-500 text-white transition-all duration-300 hover:bg-white/10"
            placeholder="Enter amount to tip"
            step="0.01"
            min="0"
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 animate-fadeIn">
            <p className="mb-2">Transaction successful!</p>
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Signature:</span>
              <div className="relative flex-1 group">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-500/20 scrollbar-track-transparent">
          <code className="text-sm font-mono break-all">{success.split('Signature: ')[1]}</code>
        </div>
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-green-500/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
        >
          <span className={`absolute inset-0 bg-white/20 transition-transform duration-300 ${loading ? 'animate-shimmer' : ''}`} />
          <span className="relative">
            {loading ? 'Processing...' : 'Send Tip'}
          </span>
        </button>
      </form>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
  
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
  
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 2px;
  }
  
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.3);
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
