<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let orderId = $derived($page.url.searchParams.get('orderId') || '');
	let status = $derived($page.url.searchParams.get('status') || 'success');

	let orderData = $state<{
		orderId: string;
		total: number;
		items: Array<{ id: string; name: string; image: string; price: number; quantity: number }>;
	} | null>(null);

	if (typeof window !== 'undefined') {
		const stored = sessionStorage.getItem('lastOrder');
		if (stored) {
			orderData = JSON.parse(stored);
		}
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function getStatusMessage() {
		switch (status) {
			case 'pending':
				return {
					title: 'Payment Pending',
					message: 'Tagihan sudah dibuat. Silakan selesaikan transfer lalu cek status pembayaran.',
					colorClasses: 'text-yellow-700 bg-yellow-50 border-yellow-200'
				};
			case 'success':
			default:
				return {
					title: 'Payment Successful',
					message: 'Pembayaran sudah terkonfirmasi. Pesanan kamu sedang diproses.',
					colorClasses: 'text-green-700 bg-green-50 border-green-200'
				};
		}
	}

	const statusInfo = getStatusMessage();
</script>

<svelte:head>
	<title>Order Status - TestStore</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
	<div class={`mb-8 rounded-lg border p-8 text-center ${statusInfo.colorClasses}`}>
		<h1 class="mb-2 text-3xl font-bold">{statusInfo.title}</h1>
		<p class="text-lg">{statusInfo.message}</p>
		{#if orderId}
			<p class="mt-3 text-sm">
				Order ID: <span class="font-mono font-semibold">{orderId}</span>
			</p>
		{/if}
	</div>

	{#if orderData}
		<div class="mb-8 rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-6 text-2xl font-bold text-gray-900">Order Details</h2>

			<div class="mb-6 space-y-4">
				{#each orderData.items as item (item.id)}
					<div class="flex items-center gap-4 border-b border-gray-200 pb-4">
						<div
							class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"
						>
							<span class="text-3xl">{item.image}</span>
						</div>
						<div class="flex-1">
							<h4 class="font-semibold text-gray-900">{item.name}</h4>
							<p class="text-sm text-gray-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
						</div>
						<p class="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
					</div>
				{/each}
			</div>

			<div class="border-t pt-4">
				<div class="flex items-center justify-between">
					<span class="text-xl font-bold text-gray-900">Total</span>
					<span class="text-3xl font-bold text-blue-600">{formatPrice(orderData.total)}</span>
				</div>
			</div>
		</div>
	{/if}

	<div class="flex justify-center gap-4">
		<a
			href="/"
			class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700"
		>
			Continue Shopping
		</a>
		<button
			onclick={() => goto('/checkout')}
			class="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition duration-200 hover:bg-gray-300"
		>
			Back to Checkout
		</button>
	</div>
</div>
