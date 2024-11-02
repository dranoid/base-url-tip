import { FC, useEffect } from 'react';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { adminWallet } from '../admin/wallet';
import { useWallet } from '@solana/wallet-adapter-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (type: 'admin' | 'devnet', wallet: any) => void;
}

export const WalletModal: FC<WalletModalProps> = ({ isOpen, onClose, onSelectWallet }) => {
  const { connected, publicKey } = useWallet();

  // Handle wallet connection success
  useEffect(() => {
    if (connected && publicKey) {
      onSelectWallet('devnet', {
        publicKey,
        signTransaction: async (tx: any) => {
          if (!window.solana) throw new Error("Phantom wallet not found");
          return await window.solana.signTransaction(tx);
        }
      });
      onClose();
    }
  }, [connected, publicKey, onClose, onSelectWallet]);

  if (!isOpen) return null;

  const handleAdminSelect = () => {
    onSelectWallet('admin', adminWallet);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl w-full max-w-md border border-purple-500/20 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Select Wallet Type
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleAdminSelect}
            className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-600/20 group-hover:bg-purple-600/30 transition-colors">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Use Admin Wallet</h3>
                <p className="text-sm text-gray-400">Connect with predefined admin credentials</p>
              </div>
            </div>
          </button>

          <div className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-pink-600/20 group-hover:bg-pink-600/30 transition-colors">
                <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Use Devnet Wallet</h3>
                <p className="text-sm text-gray-400">Connect your own Solana devnet wallet</p>
              </div>
            </div>
            <div className="mt-4">
              <WalletMultiButton className="w-full !bg-pink-600 hover:!bg-pink-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
