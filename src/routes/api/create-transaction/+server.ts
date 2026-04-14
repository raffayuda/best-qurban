import type { RequestHandler } from './$types';
import midtransClient from 'midtrans-client';
import { MIDTRANS_CLIENT_KEY, MIDTRANS_ENV, MIDTRANS_SERVER_KEY } from '$env/static/private';
import type { CartItem, CustomerInfo } from '$lib/types/product';

type PaymentMethod = 'bca_va' | 'bni_va' | 'bri_va';

interface CreateTransactionBody {
	orderId: string;
	total: number;
	items: CartItem[];
	customerInfo: CustomerInfo;
	paymentMethod: PaymentMethod;
}

const PAYMENT_METHOD_TO_BANK: Record<PaymentMethod, 'bca' | 'bni' | 'bri'> = {
	bca_va: 'bca',
	bni_va: 'bni',
	bri_va: 'bri'
};

function resolveMidtransEnvironment(): { env: 'sandbox' | 'production'; isProduction: boolean } {
	const env = (MIDTRANS_ENV || 'sandbox').trim().toLowerCase();
	if (env === 'sandbox') {
		return { env: 'sandbox', isProduction: false };
	}
	if (env === 'production') {
		return { env: 'production', isProduction: true };
	}
	throw new Error('MIDTRANS_ENV must be either "sandbox" or "production"');
}

function createCoreApiClient() {
	const serverKey = MIDTRANS_SERVER_KEY?.trim();
	const clientKey = MIDTRANS_CLIENT_KEY?.trim() || '';
	const { env, isProduction } = resolveMidtransEnvironment();

	if (!serverKey) {
		throw new Error('MIDTRANS_SERVER_KEY is not configured');
	}
	if (!/^((SB-)?Mid-server-)/.test(serverKey)) {
		throw new Error('Invalid MIDTRANS_SERVER_KEY format');
	}

	return {
		env,
		core: new midtransClient.CoreApi({
			isProduction,
			serverKey,
			clientKey
		})
	};
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
	return value === 'bca_va' || value === 'bni_va' || value === 'bri_va';
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return 'Failed to process Midtrans request';
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as Partial<CreateTransactionBody>;
		const { orderId, total, items, customerInfo, paymentMethod } = body;

		if (!orderId || typeof orderId !== 'string') {
			return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400 });
		}
		if (typeof total !== 'number' || Number.isNaN(total) || total <= 0) {
			return new Response(JSON.stringify({ error: 'total must be a positive number' }), {
				status: 400
			});
		}
		if (!Array.isArray(items) || items.length === 0) {
			return new Response(JSON.stringify({ error: 'items is required' }), { status: 400 });
		}
		if (!customerInfo || typeof customerInfo !== 'object') {
			return new Response(JSON.stringify({ error: 'customerInfo is required' }), { status: 400 });
		}
		if (!isPaymentMethod(paymentMethod)) {
			return new Response(JSON.stringify({ error: 'Unsupported paymentMethod' }), { status: 400 });
		}

		const { env, core } = createCoreApiClient();

		const chargePayload = {
			payment_type: 'bank_transfer',
			transaction_details: {
				order_id: orderId,
				gross_amount: total
			},
			customer_details: {
				first_name: customerInfo.firstName || '-',
				last_name: customerInfo.lastName || '',
				email: customerInfo.email || 'customer@example.com',
				phone: customerInfo.phone || '-'
			},
			item_details: items.map((item) => ({
				id: item.id,
				price: item.price,
				quantity: item.quantity,
				name: item.name
			})),
			bank_transfer: {
				bank: PAYMENT_METHOD_TO_BANK[paymentMethod]
			}
		};

		const chargeResponse = await core.charge(chargePayload);
		const vaNumbers = Array.isArray(chargeResponse?.va_numbers)
			? chargeResponse.va_numbers.map((entry: { bank?: string; va_number?: string }) => ({
					bank: entry.bank || '',
					vaNumber: entry.va_number || ''
				}))
			: [];

		return new Response(
			JSON.stringify({
				orderId,
				transactionId: chargeResponse.transaction_id,
				transactionStatus: chargeResponse.transaction_status,
				paymentType: chargeResponse.payment_type,
				expiryTime: chargeResponse.expiry_time,
				environment: env,
				vaNumbers
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error('Midtrans error:', error);
		return new Response(
			JSON.stringify({
				error: getErrorMessage(error)
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const orderId = url.searchParams.get('orderId');
		if (!orderId) {
			return new Response(JSON.stringify({ error: 'orderId query is required' }), { status: 400 });
		}

		const { env, core } = createCoreApiClient();
		const statusResponse = await (core as any).transaction.status(orderId);

		return new Response(
			JSON.stringify({
				orderId,
				environment: env,
				transactionStatus: statusResponse.transaction_status,
				statusCode: statusResponse.status_code,
				statusMessage: statusResponse.status_message,
				fraudStatus: statusResponse.fraud_status,
				paymentType: statusResponse.payment_type
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error('Midtrans status error:', error);
		return new Response(
			JSON.stringify({
				error: getErrorMessage(error)
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
