'use client';

import { WalletModal } from './components/WalletModal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'admin' | 'devnet' | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();

  const handleWalletSelect = (type: 'admin' | 'devnet', wallet: any) => {
    setSelectedWallet(type);
    if (wallet.publicKey) {
      if (type === 'admin') {
        router.push('/tip?type=admin');
      } else {
        router.push('/tip?type=devnet');
      }
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-purple-900 to-black text-white">
      <main className="flex flex-col gap-12 row-start-2 items-center text-center max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Welcome to BaseURL Tip
          </h1>
          <p className="text-lg text-gray-300">
            Support creators directly with PYUSD on Solana
          </p>
        </div>

        <button 
          onClick={() => setShowWalletModal(true)}
          className="group relative px-8 py-4 text-xl font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl group-hover:blur-2xl transition-all duration-200" />
          <span className="relative flex items-center gap-2">
            {publicKey ? 'Connected' : 'Connect Wallet'}
          </span>
        </button>

        <WalletModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onSelectWallet={handleWalletSelect}
        />
      </main>
    </div>
  );
}
