'use client';

import { Keypair, PublicKey } from '@solana/web3.js';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';
import { TipInterface } from '../components/TipInterface';
import { useWallet } from '@solana/wallet-adapter-react';

// Admin wallet configuration
const ADMIN_SECRET_KEY = new Uint8Array([60,75,171,71,80,65,28,208,88,150,70,83,236,46,85,214,180,99,35,114,48,11,218,196,106,200,158,37,220,150,34,34,145,79,113,118,10,235,90,251,189,202,164,133,100,240,223,221,246,186,182,23,25,22,122,170,234,69,24,244,205,77,121,244]);
const ADMIN_KEYPAIR = Keypair.fromSecretKey(ADMIN_SECRET_KEY);
const ADMIN_PUBLIC_KEY = ADMIN_KEYPAIR.publicKey;

// Admin wallet adapters
const adminWallet = {
  publicKey: ADMIN_PUBLIC_KEY,
  signTransaction: async (tx: any) => {
    tx.sign(ADMIN_KEYPAIR);
    return tx;
  },
  signAllTransactions: async (txs: any[]) => {
    return txs.map(tx => {
      tx.sign(ADMIN_KEYPAIR);
      return tx;
    });
  }
};

function TipPageContent() {
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();
  const router = useRouter();
  const walletType = searchParams.get('type');
  const creatorAddress = searchParams.get('address'); // Get creator address from query params

  // Redirect if no wallet type specified
  if (!walletType) {
    router.push('/');
    return null;
  }

  // Get current wallet based on type
  const currentWallet = walletType === 'admin' ? adminWallet : { 
    publicKey,
    signTransaction: async (tx: unknown) => {
      if (!window.solana) throw new Error("Phantom wallet not found");
      return await window.solana.signTransaction(tx);
    }
  };

  // Show connect wallet message if no wallet is connected
  if (!currentWallet.publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/5 backdrop-blur-lg shadow rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">
              Please connect your wallet to continue
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <TipInterface 
        wallet={walletType === 'admin' ? adminWallet : { 
          publicKey: publicKey as PublicKey, 
          signTransaction: async (tx: unknown) => {
            if (!window.solana) throw new Error("Phantom wallet not found");
            return await window.solana.signTransaction(tx);
          }
        }} 
        isAdmin={walletType === 'admin'}
        initialCreatorAddress={creatorAddress || ''} // Pass the creator address
      />
    </div>
  );
}

export default function TipPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/5 backdrop-blur-lg shadow rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <TipPageContent />
    </Suspense>
  );
}
