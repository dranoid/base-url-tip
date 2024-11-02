import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
	TOKEN_2022_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	createTransferCheckedInstruction,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';

const PYUSD_MINT = new PublicKey(
	'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM'
);

export async function createTransferTransaction(
	connection: Connection,
	sender: PublicKey,
	recipient: PublicKey,
	amount: number
): Promise<Transaction> {
	try {
		// Validate recipient address
		// if (!PublicKey.isOnCurve(recipient.toBytes())) {
		// 	throw new Error(
		// 		'Invalid recipient address: Address must be on ed25519 curve'
		// 	);
		// }

		const transaction = new Transaction();

		// Get sender's ATA
		const senderATA = getAssociatedTokenAddressSync(
			PYUSD_MINT,
			sender,
			false,
			TOKEN_2022_PROGRAM_ID
		);

		// Check sender's ATA exists

		// Get recipient's ATA
		const recipientATA = getAssociatedTokenAddressSync(
			PYUSD_MINT,
			recipient,
			false,
			TOKEN_2022_PROGRAM_ID
		);

		// Check recipient's ATA
		const recipientAccount = await connection.getAccountInfo(recipientATA);
		if (!recipientAccount) {
			// Create recipient's ATA if it doesn't exist
			transaction.add(
				createAssociatedTokenAccountInstruction(
					sender,
					recipientATA,
					recipient,
					PYUSD_MINT,
					TOKEN_2022_PROGRAM_ID
				)
			);
		}

		// Get sender's balance and validate amount
		const balance = await connection.getTokenAccountBalance(senderATA);
		if (!balance.value.uiAmount && balance.value.uiAmount !== 0) {
			throw new Error('Failed to fetch balance');
		}

		if (Number(balance.value.uiAmount) < amount) {
			throw new Error(
				`Insufficient PYUSD balance. Available: ${balance.value.uiAmount} PYUSD`
			);
		}

		// Add transfer instruction
		const amountInSmallestUnit = BigInt(
			Math.floor(amount * Math.pow(10, balance.value.decimals))
		);
		transaction.add(
			createTransferCheckedInstruction(
				senderATA,
				PYUSD_MINT,
				recipientATA,
				sender,
				amountInSmallestUnit,
				balance.value.decimals,
				[],
				TOKEN_2022_PROGRAM_ID
			)
		);

		return transaction;
	} catch (error) {
		console.error('Error in createTransferTransaction:', error);
		throw error;
	}
}
