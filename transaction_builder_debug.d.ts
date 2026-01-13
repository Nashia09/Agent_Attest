/**
 * Transaction Builder
 *
 * This module provides a class-based API for building and signing Amadeus protocol transactions.
 */
import type { PrivKey } from '@noble/curves/utils';
import type { BuildTransactionResult, SerializableValue, TransferTransactionInput, UnsignedTransactionWithHash } from './types';
/**
 * Transaction Builder for Amadeus Protocol
 *
 * Provides methods for building and signing transactions. Can be instantiated
 * with a private key for convenience, or used statically.
 *
 * @example
 * ```ts
 * // Instance-based usage
 * const builder = new TransactionBuilder('5Kd3N...')
 * const { txHash, txPacked } = builder.transfer({
 *   recipient: '5Kd3N...',
 *   amount: 10.5,
 *   symbol: 'AMA'
 * })
 *
 * // Static usage
 * const { txHash, txPacked } = TransactionBuilder.buildTransfer({
 *   senderPrivkey: '5Kd3N...',
 *   recipient: '5Kd3N...',
 *   amount: 10.5,
 *   symbol: 'AMA'
 * })
 * ```
 */
export declare class TransactionBuilder {
    private readonly privateKey;
    private signerPk;
    private signerSk;
    /**
     * Domain Separation Tag for transaction signatures
     */
    private static readonly TX_DST;
    /**
     * Create a new TransactionBuilder instance
     *
     * @param privateKey - Optional Base58 encoded private key (seed). If provided,
     *                     the builder will use this key for all transactions.
     */
    constructor(privateKey?: string);
    /**
     * Generate a transaction nonce based on current timestamp
     */
    private static generateNonce;
    /**
     * Create transaction structure
     */
    private static createTransaction;
    /**
     * Build an unsigned transaction (returns transaction structure and hash)
     */
    private static buildUnsignedTransaction;
    /**
     * Normalize signer secret key to PrivKey format (handles Base58 strings)
     */
    private static normalizeSignerSk;
    /**
     * Sign a transaction hash using BLS12-381 with transaction DST
     */
    private static signHash;
    /**
     * Sign an unsigned transaction
     */
    private static signTransaction;
    /**
     * Build and sign a transaction (convenience method)
     */
    private static buildAndSignTransaction;
    /**
     * Initialize signer keys from the private key
     */
    private initializeKeys;
    /**
     * Build an unsigned transaction
     *
     * @param contract - Contract name
     * @param method - Method name
     * @param args - Method arguments
     * @param signerPk - Optional signer's public key (required if instance has no private key)
     * @returns Unsigned transaction with hash
     *
     * @example
     * ```ts
     * const builder = new TransactionBuilder('5Kd3N...')
     * const unsignedTx = builder.build('Coin', 'transfer', [
     *   recipientBytes,
     *   '1000000000',
     *   'AMA'
     * ])
     * // Can inspect or modify before signing
     * const { txHash, txPacked } = builder.sign(unsignedTx)
     * ```
     */
    build(contract: string, method: string, args: SerializableValue[], signerPk?: Uint8Array): UnsignedTransactionWithHash;
    /**
     * Get the signer's secret key (normalizes to PrivKey format)
     * Handles Base58 strings, PrivKey (Uint8Array), or uses cached/derived key
     */
    private getSignerSk;
    /**
     * Sign an unsigned transaction
     *
     * @param unsignedTx - Unsigned transaction with hash
     * @param signerSk - Optional signer's secret key (required if instance has no private key)
     * @returns Transaction hash and packed transaction
     *
     * @example
     * ```ts
     * const builder = new TransactionBuilder('5Kd3N...')
     * const unsignedTx = builder.build('Coin', 'transfer', args)
     * const { txHash, txPacked } = builder.sign(unsignedTx)
     * ```
     */
    sign(unsignedTx: UnsignedTransactionWithHash, signerSk?: PrivKey | string | Uint8Array): BuildTransactionResult;
    /**
     * Build and sign a generic transaction (convenience method)
     *
     * @param contract - Contract name
     * @param method - Method name
     * @param args - Method arguments
     * @param signerPk - Optional signer's public key (required if instance has no private key)
     * @param signerSk - Optional signer's secret key (required if instance has no private key)
     * @returns Transaction hash and packed transaction
     *
     * @example
     * ```ts
     * const builder = new TransactionBuilder('5Kd3N...')
     * const { txHash, txPacked } = builder.buildAndSign('Coin', 'transfer', [
     *   recipientBytes,
     *   '1000000000',
     *   'AMA'
     * ])
     * ```
     */
    buildAndSign(contract: string, method: string, args: SerializableValue[], signerPk?: Uint8Array, signerSk?: PrivKey | string | Uint8Array): BuildTransactionResult;
    /**
     * Build an unsigned transfer transaction
     *
     * @param input - Transfer transaction parameters
     * @returns Unsigned transaction with hash
     *
     * @example
     * ```ts
     * const builder = new TransactionBuilder('5Kd3N...')
     * const unsignedTx = builder.buildTransfer({
     *   recipient: '5Kd3N...',
     *   amount: 10.5,
     *   symbol: 'AMA'
     * })
     * ```
     */
    buildTransfer(input: Omit<TransferTransactionInput, 'senderPrivkey'>): UnsignedTransactionWithHash;
    /**
     * Build and sign a transfer transaction (convenience method)
     *
     * @param input - Transfer transaction parameters
     * @returns Transaction hash and packed transaction
     *
     * @example
     * ```ts
     * const builder = new TransactionBuilder('5Kd3N...')
     * const { txHash, txPacked } = builder.transfer({
     *   recipient: '5Kd3N...',
     *   amount: 10.5,
     *   symbol: 'AMA'
     * })
     * ```
     */
    transfer(input: Omit<TransferTransactionInput, 'senderPrivkey'>): BuildTransactionResult;
    /**
     * Build an unsigned transfer transaction (static method)
     *
     * @param input - Transfer transaction parameters (without senderPrivkey)
     * @param signerPk - Signer's public key
     * @returns Unsigned transaction with hash
     *
     * @example
     * ```ts
     * const unsignedTx = TransactionBuilder.buildTransfer(
     *   { recipient: '5Kd3N...', amount: 10.5, symbol: 'AMA' },
     *   publicKey
     * )
     * ```
     */
    static buildTransfer(input: Omit<TransferTransactionInput, 'senderPrivkey'>, signerPk: Uint8Array): UnsignedTransactionWithHash;
    /**
     * Build and sign a transfer transaction (static method)
     *
     * @param input - Transfer transaction parameters
     * @returns Transaction hash and packed transaction
     *
     * @example
     * ```ts
     * const { txHash, txPacked } = TransactionBuilder.buildSignedTransfer({
     *   senderPrivkey: '5Kd3N...',
     *   recipient: '5Kd3N...',
     *   amount: 10.5,
     *   symbol: 'AMA'
     * })
     * ```
     */
    static buildSignedTransfer(input: TransferTransactionInput): BuildTransactionResult;
    /**
     * Build an unsigned transaction (static method)
     *
     * @param signerPk - Signer's public key
     * @param contract - Contract name
     * @param method - Method name
     * @param args - Method arguments
     * @returns Unsigned transaction with hash
     *
     * @example
     * ```ts
     * const unsignedTx = TransactionBuilder.build(
     *   publicKey,
     *   'Coin',
     *   'transfer',
     *   [recipientBytes, amount, 'AMA']
     * )
     * ```
     */
    static build(signerPk: Uint8Array, contract: string, method: string, args: SerializableValue[]): UnsignedTransactionWithHash;
    /**
     * Sign an unsigned transaction (static method)
     *
     * @param unsignedTx - Unsigned transaction with hash
     * @param signerSk - Signer's secret key
     * @returns Transaction hash and packed transaction
     *
     * @example
     * ```ts
     * const unsignedTx = TransactionBuilder.build(publicKey, 'Coin', 'transfer', args)
     * const { txHash, txPacked } = TransactionBuilder.sign(unsignedTx, secretKey)
     * ```
     */
    static sign(unsignedTx: UnsignedTransactionWithHash, signerSk: PrivKey | string | Uint8Array): BuildTransactionResult;
    /**
     * Build and sign a generic transaction (static method)
     *
     * @param signerPk - Signer's public key
     * @param signerSk - Signer's secret key
     * @param contract - Contract name
     * @param method - Method name
     * @param args - Method arguments
     * @returns Transaction hash and packed transaction
     *
     * @example
     * ```ts
     * const { txHash, txPacked } = TransactionBuilder.buildAndSign(
     *   publicKey,
     *   secretKey,
     *   'Coin',
     *   'transfer',
     *   [recipientBytes, amount, 'AMA']
     * )
     * ```
     */
    static buildAndSign(signerPk: Uint8Array, signerSk: PrivKey | string | Uint8Array, contract: string, method: string, args: SerializableValue[]): BuildTransactionResult;
}
//# sourceMappingURL=transaction-builder.d.ts.map