<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import type { CustomerInfo } from '$lib/types/product';
	import type { CartItem as StoreCartItem } from '$lib/stores/cart';

	const PAYMENT_OPTIONS = [
		{
			id: 'qris',
			label: 'QRIS (Semua e-Wallet & Bank)',
			description: 'Scan QR Code menggunakan aplikasi Bank / e-Wallet Anda'
		}
	];

	let loading = $state(false);
	let error = $state<string | null>(null);
	let showPaymentModal = $state(false);
	let showQris = $state(false);
	let paymentSuccess = $state(false);
	let qrisUrl = $state<string | null>(null);
	let mockPaymentTimeout = $state<number | null>(null);
	
	let pendingCheckout = $state<any>(null);
	let checkoutSelection = $state<{mode: 'all'|'selected', itemIds: number[]}>({ mode: 'all', itemIds: [] });

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	let checkoutItems = $derived.by(() => {
		if (checkoutSelection.mode === 'selected') {
			return $cart.filter((item) => checkoutSelection.itemIds.includes(item.id as number));
		}

		return $cart;
	});

	let checkoutTotal = $derived(
		checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

	onMount(() => {
		if (typeof window === 'undefined') return;

		const rawSelection = sessionStorage.getItem('checkoutSelection');
		if (!rawSelection) return;

		try {
			const parsed = JSON.parse(rawSelection) as CheckoutSelection;
			if (
				(parsed.mode === 'all' || parsed.mode === 'selected') &&
				Array.isArray(parsed.itemIds)
			) {
				checkoutSelection = {
					mode: parsed.mode,
					itemIds: parsed.itemIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
				};
			}
		} catch {
			checkoutSelection = { mode: 'all', itemIds: [] };
		}
	});

	function generateOrderId(): string {
		const timestamp = Date.now();
		const random = Math.floor(Math.random() * 10000);
		return `ORDER-${timestamp}-${random}`;
	}

	function openPaymentModal(event: Event) {
		event.preventDefault();

		if (checkoutItems.length === 0) {
			error = 'Tidak ada hewan yang dipilih untuk checkout';
			return;
		}

		error = null;
		showQris = false;
		paymentSuccess = false;

		const customerInfo = {
			firstName,
			lastName,
			email,
			phone,
			address,
			city,
			postalCode
		};

		pendingCheckout = {
			orderId: generateOrderId(),
			total: checkoutTotal,
			items: [...checkoutItems],
			customerInfo
		};

		showPaymentModal = true;
	}

	function closePaymentModal() {
		showPaymentModal = false;
		showQris = false;
		paymentSuccess = false;
		if (mockPaymentTimeout) {
			clearTimeout(mockPaymentTimeout);
		}
		// Refresh specific state if they close early or finished payment
		if (checkoutItems.length === 0) {
			goto('/');
		}
	}

	async function simulatePayment() {
		if (!pendingCheckout) return;

		loading = true;

		// Simulate API call to create QRIS
		await new Promise(resolve => setTimeout(resolve, 800));
		
		// Generate QR Code URL using QRServer API
		const qrData = encodeURIComponent(`QRIS-${pendingCheckout.orderId}-${pendingCheckout.total}`);
		qrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}&color=047857`;
		
		showQris = true;
		loading = false;

		// Automatically simulate successful payment after 4 seconds
		mockPaymentTimeout = setTimeout(() => {
			if (checkoutSelection.mode === 'selected') {
				cart.removeItems(checkoutSelection.itemIds);
			} else {
				cart.clear();
			}

			if (typeof window !== 'undefined') {
				sessionStorage.removeItem('checkoutSelection');
			}

			paymentSuccess = true;
		}, 4000) as unknown as number;
	}
</script>

<svelte:head>
	<title>Checkout - TestStore</title>
</svelte:head>

<div class="px-4 md:px-12 max-w-7xl mx-auto pb-20 pt-12">
	<!-- Hero Header -->
	<div class="mb-12 rounded-xl clay-card bg-surface-container-low p-10">
		<div class="flex items-center gap-4 mb-4">
			<span class="material-symbols-outlined text-4xl text-primary">shopping_cart_checkout</span>
			<h1 class="font-headline text-4xl font-black text-on-surface tracking-tighter md:text-5xl">Checkout</h1>
		</div>
		<p class="text-on-surface-variant font-medium text-lg">
			Selesaikan pesanan kurban Anda dengan mengisi informasi di bawah ini.
		</p>
	</div>

	{#if checkoutItems.length === 0}
		<!-- Empty Cart State -->
		<div class="text-center py-20 clay-card bg-surface-container-low rounded-xl">
			<span class="material-symbols-outlined text-8xl text-primary/30 mb-6 inline-block">remove_shopping_cart</span>
			<h2 class="font-headline text-3xl font-black text-on-surface mb-4">Belum ada hewan untuk checkout</h2>
			<p class="text-on-surface-variant font-medium text-lg mb-8 max-w-md mx-auto">
				Pilih hewan terlebih dahulu dari keranjang, lalu lanjutkan ke checkout.
			</p>
			<a href="/keranjang" class="inline-flex items-center gap-3 clay-button-primary bg-primary text-on-primary px-10 py-5 rounded-full font-headline font-bold text-lg transition-transform hover:scale-105">
				<span class="material-symbols-outlined">shopping_cart</span>
				Kembali ke Keranjang
			</a>
		</div>
	{:else}
		<form onsubmit={openPaymentModal} class="grid grid-cols-1 gap-10 lg:grid-cols-2">
			<!-- Customer Info -->
			<div class="clay-card bg-surface-container-lowest rounded-xl p-8">
				<h2 class="mb-6 font-headline text-2xl font-black text-on-surface tracking-tighter">Informasi Pemesan</h2>
				
				<div class="space-y-5">
					<div class="grid grid-cols-2 gap-4">
						<div class="clay-recessed bg-white rounded-xl p-1">
							<input
								type="text" id="firstName" bind:value={firstName} required placeholder="Nama Depan *"
								class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
							/>
						</div>
						<div class="clay-recessed bg-white rounded-xl p-1">
							<input
								type="text" id="lastName" bind:value={lastName} required placeholder="Nama Belakang *"
								class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
							/>
						</div>
					</div>

					<div class="clay-recessed bg-white rounded-xl p-1">
						<input
							type="email" id="email" bind:value={email} required placeholder="Email *"
							class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
						/>
					</div>

					<div class="clay-recessed bg-white rounded-xl p-1">
						<input
							type="tel" id="phone" bind:value={phone} required placeholder="Nomor Telepon *"
							class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
						/>
					</div>

					<div class="clay-recessed bg-white rounded-xl p-1">
						<textarea
							id="address" bind:value={address} required rows="3" placeholder="Alamat Lengkap *"
							class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 resize-none"
						></textarea>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="clay-recessed bg-white rounded-xl p-1">
							<input
								type="text" id="city" bind:value={city} required placeholder="Kota *"
								class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
							/>
						</div>
						<div class="clay-recessed bg-white rounded-xl p-1">
							<input
								type="text" id="postalCode" bind:value={postalCode} required placeholder="Kode Pos *"
								class="w-full bg-transparent border-none px-4 py-3 font-medium text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Order Summary -->
			<div class="clay-card bg-surface-container-lowest rounded-xl p-8 h-fit lg:sticky lg:top-32">
				<h2 class="mb-6 font-headline text-2xl font-black text-on-surface tracking-tighter">Ringkasan Pesanan</h2>

				<div class="mb-6 rounded-lg bg-primary-container/30 px-4 py-3 text-sm text-primary font-medium border border-primary/20">
					Mode checkout: <span class="font-bold">{checkoutSelection.mode === 'selected' ? 'Hewan Terpilih' : 'Semua Hewan'}</span>
				</div>

				<div class="mb-6 space-y-4">
					{#each checkoutItems as item (item.id)}
						<div class="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-surface-container pb-4">
							<div class="h-20 w-full sm:w-20 shrink-0 rounded-xl overflow-hidden clay-recessed">
								{#if item.image.startsWith('http') || item.image.startsWith('/')}
									<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
								{:else}
									<div class="flex h-full w-full items-center justify-center bg-surface-container-highest text-3xl">
										{item.image}
									</div>
								{/if}
							</div>
							<div class="flex-1">
								<h4 class="font-headline font-bold text-on-surface text-lg">{item.name}</h4>
								<p class="text-sm font-medium text-on-surface-variant">Qty: {item.quantity}</p>
							</div>
							<p class="font-headline font-black text-primary">{formatPrice(item.price * item.quantity)}</p>
						</div>
					{/each}
				</div>

				<div class="mb-6 space-y-3">
					<div class="flex justify-between text-on-surface-variant font-medium">
						<span>Subtotal</span>
						<span class="font-bold">{formatPrice(checkoutTotal)}</span>
					</div>
					<div class="flex justify-between text-on-surface-variant font-medium">
						<span>Ongkos Kirim</span>
						<span class="font-bold text-emerald-600">Gratis</span>
					</div>
				</div>

				<div class="mb-8 border-t border-surface-container pt-4">
					<div class="flex items-end justify-between">
						<span class="text-lg font-bold text-on-surface">Total</span>
						<span class="font-headline text-3xl font-black text-primary">{formatPrice(checkoutTotal)}</span>
					</div>
				</div>

				{#if error}
					<div class="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full clay-button-primary rounded-full bg-primary py-4 font-headline text-lg font-bold text-on-primary transition-transform hover:scale-105"
				>
					Lanjut ke Pembayaran
				</button>
			</div>
		</form>
	{/if}
</div>

{#if showPaymentModal}
	<div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
		<div class="w-full max-w-sm overflow-hidden rounded-2xl clay-card bg-surface-container-lowest">
			<div class="flex items-center justify-between border-b border-surface-container px-6 py-5">
				<div>
					<h3 class="font-headline text-xl font-black text-on-surface tracking-tighter">
						{paymentSuccess ? 'Status Pembayaran' : 'Pembayaran QRIS'}
					</h3>
					<p class="text-xs font-medium text-on-surface-variant mt-1">Order: {pendingCheckout?.orderId || '-'}</p>
				</div>
				<button
					type="button"
					onclick={closePaymentModal}
					class="rounded-full bg-surface-container-high w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors"
				>
					<span class="material-symbols-outlined text-sm">close</span>
				</button>
			</div>

			<div class="space-y-6 p-6">
				{#if paymentSuccess}
					<div class="text-center py-6">
						<div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 clay-recessed shadow-inner border border-emerald-200">
							<span class="material-symbols-outlined text-5xl">check_circle</span>
						</div>
						<h4 class="mb-2 font-headline text-2xl font-black text-on-surface tracking-tighter">Pembayaran Berhasil!</h4>
						<p class="text-sm font-medium text-on-surface-variant mb-8">Terima kasih, pembayaran untuk pesanan <span class="font-bold text-on-surface">{pendingCheckout?.orderId}</span> senilai <span class="font-bold text-primary">{formatPrice(pendingCheckout?.total || 0)}</span> telah dikonfirmasi.</p>
						
						<button
							type="button"
							onclick={() => {
								closePaymentModal();
								goto('/cek-pesanan');
							}}
							class="w-full rounded-full clay-button-primary bg-primary py-3.5 font-headline text-base font-bold text-on-primary transition-transform hover:scale-[1.02]"
						>
							Selesai & Cek Pesanan
						</button>
					</div>
				{:else if !showQris}
					<div class="text-center">
						<span class="material-symbols-outlined text-6xl text-primary mb-4 block">qr_code_scanner</span>
						<h4 class="mb-2 font-headline text-lg font-bold text-on-surface">Bayar dengan QRIS</h4>
						<p class="text-sm font-medium text-on-surface-variant mb-6">Scan QR code menggunakan aplikasi GoPay, OVO, Dana, LinkAja, atau Mobile Banking pilihan Anda.</p>
					</div>

					<button
						type="button"
						disabled={loading}
						onclick={simulatePayment}
						class="w-full rounded-full clay-button-primary bg-primary py-3.5 font-headline text-base font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
					>
						{loading ? 'Membuat QRIS...' : 'Tampilkan QRIS'}
					</button>
				{:else}
					<div class="text-center">
						<div class="mb-4 rounded-xl border border-surface-container p-4 clay-recessed bg-white mx-auto max-w-[250px]">
							<img src={qrisUrl} alt="Kode QRIS" class="w-full h-auto aspect-square object-contain" />
						</div>
						
						<h4 class="mb-1 font-headline text-2xl font-black text-primary">{formatPrice(pendingCheckout?.total || 0)}</h4>
						<p class="text-sm font-medium text-on-surface-variant mb-4">A L - Q U R B A N</p>

						<div class="flex flex-col items-center justify-center gap-3 bg-primary-container/30 text-primary p-4 rounded-xl border border-primary/20">
							<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
							<p class="font-bold text-sm">Menunggu pembayaran otomatis (Dummy)...</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
