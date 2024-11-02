import { Keypair, PublicKey } from '@solana/web3.js';

// Admin wallet configuration (similar to the reference codebase)
const ADMIN_SECRET_KEY = new Uint8Array([
	60, 75, 171, 71, 80, 65, 28, 208, 88, 150, 70, 83, 236, 46, 85, 214, 180, 99,
	35, 114, 48, 11, 218, 196, 106, 200, 158, 37, 220, 150, 34, 34, 145, 79, 113,
	118, 10, 235, 90, 251, 189, 202, 164, 133, 100, 240, 223, 221, 246, 186, 182,
	23, 25, 22, 122, 170, 234, 69, 24, 244, 205, 77, 121, 244,
]); // You'll need to add this
const ADMIN_KEYPAIR = Keypair.fromSecretKey(ADMIN_SECRET_KEY);
const ADMIN_PUBLIC_KEY = ADMIN_KEYPAIR.publicKey;
const PYUSD_MINT = new PublicKey(
	'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM'
);

export const adminWallet = {
	publicKey: ADMIN_PUBLIC_KEY,
	signTransaction: async (tx: any) => {
		tx.sign(ADMIN_KEYPAIR);
		return tx;
	},
	signAllTransactions: async (txs: any[]) => {
		return txs.map((tx) => {
			tx.sign(ADMIN_KEYPAIR);
			return tx;
		});
	},
};

export { PYUSD_MINT };
