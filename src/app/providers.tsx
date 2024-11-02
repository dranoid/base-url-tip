'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { ReactNode, useMemo } from 'react';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';

export default function Providers({ children }: { children: ReactNode }) {
    const wallets = useMemo(
        () => [new PhantomWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={RPC_ENDPOINT}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
