<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	interface CompletedOrder {
		orderId: string;
		total: number;
		items: Array<{ id: number | string; name: string; image: string; price: number; quantity: number }>;
	}

	let orderId = $derived($page.url.searchParams.get('orderId') || '');
	let status = $derived($page.url.searchParams.get('status') || 'success');

	let orderData = $state<CompletedOrder | null>(null);

	if (typeof window !== 'undefined') {
		const stored = sessionStorage.getItem('lastOrder');
		if (stored) {
			orderData = JSON.parse(stored) as CompletedOrder;
		}
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function getStatusContent() {
		if (status === 'pending') {
			return {
				title: 'Checkout Tersimpan',
				description: 'Tagihan sudah dibuat. Silakan selesaikan transfer lalu cek status pembayaran.',
				classes: 'border-yellow-200 bg-yellow-50 text-yellow-800'
			};
		}

		return {
			title: 'Checkout Berhasil',
			description: 'Pembayaran terkonfirmasi dan pesanan hewan kurban sedang diproses.',
			classes: 'border-green-200 bg-green-50 text-green-800'
		};
	}

	let statusContent = $derived(getStatusContent());
</script>

<svelte:head>
	<title>Selesai Checkout - TestStore</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
	<div class={`mb-8 rounded-xl border p-8 ${statusContent.classes}`}>
		<h1 class="text-3xl font-bold">{statusContent.title}</h1>
		<p class="mt-2 text-base">{statusContent.description}</p>
		{#if orderId}
			<p class="mt-4 text-sm">
				Order ID: <span class="font-mono font-semibold">{orderId}</span>
			</p>
		{/if}
	</div>

	{#if orderData}
		<div class="rounded-xl bg-white p-6 shadow-md">
			<h2 class="mb-5 text-2xl font-bold text-gray-900">Ringkasan Pesanan</h2>
			<div class="space-y-4">
				{#each orderData.items as item (item.id)}
					<div class="flex items-center justify-between border-b border-gray-200 pb-4">
						<div class="flex items-center gap-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xl">
								{item.image}
							</div>
							<div>
								<p class="font-semibold text-gray-900">{item.name}</p>
								<p class="text-sm text-gray-500">Qty: {item.quantity}</p>
							</div>
						</div>
						<p class="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
					</div>
				{/each}
			</div>

			<div class="mt-6 border-t pt-4">
				<div class="flex items-center justify-between">
					<span class="text-lg font-semibold text-gray-700">Total</span>
					<span class="text-2xl font-bold text-blue-600">{formatPrice(orderData.total)}</span>
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-8 flex flex-wrap gap-3">
		<a
			href="/"
			class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
		>
			Kembali Belanja
		</a>
		<button
			onclick={() => goto('/cart')}
			class="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
		>
			Lihat Keranjang
		</button>
	</div>
</div>
