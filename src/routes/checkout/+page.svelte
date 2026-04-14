<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import type { CustomerInfo } from '$lib/types/product';
	import type { CartItem as StoreCartItem } from '$lib/stores/cart';

	type PaymentMethod = 'bca_va' | 'bni_va' | 'bri_va';

	interface PendingCheckout {
		orderId: string;
		total: number;
		items: StoreCartItem[];
		customerInfo: CustomerInfo;
	}

	interface CheckoutSelection {
		mode: 'all' | 'selected';
		itemIds: number[];
	}

	interface PaymentCreationResponse {
		orderId: string;
		transactionId: string;
		transactionStatus: string;
		paymentType: string;
		expiryTime: string;
		environment: 'sandbox' | 'production';
		vaNumbers: Array<{
			bank: string;
			vaNumber: string;
		}>;
	}

	interface PaymentStatusResponse {
		orderId: string;
		transactionStatus: string;
		statusCode: string;
		statusMessage: string;
		fraudStatus?: string;
		paymentType: string;
	}

	const PAYMENT_OPTIONS: Array<{
		id: PaymentMethod;
		label: string;
		description: string;
	}> = [
		{
			id: 'bca_va',
			label: 'BCA Virtual Account',
			description: 'Transfer via m-BCA, KlikBCA, atau ATM BCA'
		},
		{
			id: 'bni_va',
			label: 'BNI Virtual Account',
			description: 'Transfer via BNI Mobile, ATM, atau internet banking'
		},
		{
			id: 'bri_va',
			label: 'BRI Virtual Account',
			description: 'Transfer via BRImo, ATM BRI, atau internet banking'
		}
	];

	let loading = $state(false);
	let checkingStatus = $state(false);
	let error = $state<string | null>(null);
	let modalError = $state<string | null>(null);
	let modalInfo = $state<string | null>(null);
	let showPaymentModal = $state(false);
	let selectedPaymentMethod = $state<PaymentMethod>('bca_va');
	let pendingCheckout = $state<PendingCheckout | null>(null);
	let paymentResult = $state<PaymentCreationResponse | null>(null);
	let checkoutSelection = $state<CheckoutSelection>({ mode: 'all', itemIds: [] });

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
		modalError = null;
		modalInfo = null;
		selectedPaymentMethod = 'bca_va';
		paymentResult = null;

		const customerInfo: CustomerInfo = {
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
		loading = false;
		checkingStatus = false;
		modalError = null;
		modalInfo = null;
	}

	async function createPaymentInvoice() {
		if (!pendingCheckout) return;

		loading = true;
		modalError = null;
		modalInfo = null;

		try {
			const response = await fetch('/api/create-transaction', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					orderId: pendingCheckout.orderId,
					total: pendingCheckout.total,
					items: pendingCheckout.items,
					customerInfo: pendingCheckout.customerInfo,
					paymentMethod: selectedPaymentMethod
				})
			});

			const data = (await response.json()) as PaymentCreationResponse | { error?: string };
			if (!response.ok) {
				throw new Error((data as { error?: string }).error || 'Failed to create Midtrans charge');
			}

			paymentResult = data as PaymentCreationResponse;
			modalInfo = 'Tagihan berhasil dibuat. Silakan transfer ke nomor Virtual Account di bawah.';

			sessionStorage.setItem(
				'lastOrder',
				JSON.stringify({
					orderId: pendingCheckout.orderId,
					total: pendingCheckout.total,
					items: pendingCheckout.items
				})
			);
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Failed to create payment invoice';
		} finally {
			loading = false;
		}
	}

	async function checkPaymentStatus() {
		if (!paymentResult) return;

		checkingStatus = true;
		modalError = null;
		modalInfo = null;

		try {
			const response = await fetch(
				`/api/create-transaction?orderId=${encodeURIComponent(paymentResult.orderId)}`
			);
			const data = (await response.json()) as PaymentStatusResponse | { error?: string };
			if (!response.ok) {
				throw new Error((data as { error?: string }).error || 'Failed to check payment status');
			}

			const status = (data as PaymentStatusResponse).transactionStatus;

			if (status === 'settlement' || status === 'capture') {
				if (checkoutSelection.mode === 'selected') {
					cart.removeItems(checkoutSelection.itemIds);
				} else {
					cart.clear();
				}

				if (typeof window !== 'undefined') {
					sessionStorage.removeItem('checkoutSelection');
				}

				showPaymentModal = false;
				goto(`/checkout/selesai?orderId=${paymentResult.orderId}&status=success`);
				return;
			}

			if (status === 'deny' || status === 'cancel' || status === 'expire' || status === 'failure') {
				modalError = `Pembayaran gagal dengan status "${status}". Coba ulangi checkout.`;
				return;
			}

			modalInfo = `Status pembayaran saat ini: ${status}. Lakukan transfer lalu tekan "Cek Status Pembayaran".`;
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Failed to check payment status';
		} finally {
			checkingStatus = false;
		}
	}

	async function copyToClipboard(value: string) {
		try {
			await navigator.clipboard.writeText(value);
			modalInfo = 'Nomor Virtual Account berhasil disalin.';
		} catch {
			modalError = 'Gagal menyalin nomor Virtual Account.';
		}
	}

	function goToPendingPage() {
		if (!paymentResult) return;
		showPaymentModal = false;
		goto(`/checkout/selesai?orderId=${paymentResult.orderId}&status=pending`);
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
		<div class="w-full max-w-2xl overflow-hidden rounded-2xl clay-card bg-surface-container-lowest">
			<div class="flex items-center justify-between border-b border-surface-container px-8 py-6">
				<div>
					<h3 class="font-headline text-2xl font-black text-on-surface tracking-tighter">Pembayaran Midtrans</h3>
					<p class="text-sm font-medium text-on-surface-variant mt-1">Order: {pendingCheckout?.orderId || '-'}</p>
				</div>
				<button
					type="button"
					onclick={closePaymentModal}
					class="rounded-full bg-surface-container-high w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors"
				>
					<span class="material-symbols-outlined text-lg">close</span>
				</button>
			</div>

			<div class="space-y-6 p-8">
				{#if !paymentResult}
					<div>
						<h4 class="mb-4 font-headline text-xl font-bold text-on-surface">Pilih Metode Pembayaran</h4>
						<div class="space-y-4">
							{#each PAYMENT_OPTIONS as option}
								<button
									type="button"
									onclick={() => (selectedPaymentMethod = option.id)}
									class={`w-full rounded-xl border p-5 text-left transition-all ${
										selectedPaymentMethod === option.id
											? 'border-primary bg-primary-container/20 clay-recessed shadow-inner'
											: 'border-surface-container hover:border-surface-container-high bg-white'
									}`}
								>
									<p class="font-headline font-bold text-lg text-on-surface">{option.label}</p>
									<p class="text-sm font-medium text-on-surface-variant mt-1">{option.description}</p>
								</button>
							{/each}
						</div>
					</div>

					<button
						type="button"
						disabled={loading}
						onclick={createPaymentInvoice}
						class="w-full rounded-full clay-button-primary bg-primary py-4 font-headline text-lg font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
					>
						{loading ? 'Membuat tagihan...' : 'Buat Tagihan Midtrans'}
					</button>
				{:else}
					<div class="rounded-xl border border-primary/20 bg-primary-container/20 p-5 mt-2">
						<p class="font-headline font-bold text-primary text-lg">Tagihan berhasil dibuat</p>
						<p class="text-sm font-medium text-on-surface-variant mt-1">
							Status awal: <span class="font-bold text-on-surface">{paymentResult.transactionStatus}</span> | Expired: {paymentResult.expiryTime}
						</p>
					</div>

					<div class="rounded-xl border border-surface-container p-5 clay-recessed bg-white">
						<p class="mb-2 text-sm font-bold text-on-surface-variant">Transaction ID</p>
						<p class="font-mono text-sm break-all font-medium text-on-surface">{paymentResult.transactionId}</p>
					</div>

					<div>
						<h4 class="mb-3 font-headline text-xl font-bold text-on-surface">Nomor Virtual Account</h4>
						<div class="space-y-3">
							{#each paymentResult.vaNumbers as va (va.bank)}
								<div
									class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-surface-container p-5 clay-recessed bg-white"
								>
									<div>
										<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{va.bank}</p>
										<p class="font-headline text-2xl font-black text-primary tracking-wider">{va.vaNumber}</p>
									</div>
									<button
										type="button"
										onclick={() => copyToClipboard(va.vaNumber)}
										class="rounded-full bg-surface-container-high px-6 py-2.5 font-bold text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
									>
										<span class="material-symbols-outlined text-sm">content_copy</span>
										Salin
									</button>
								</div>
							{/each}
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
						<button
							type="button"
							disabled={checkingStatus}
							onclick={checkPaymentStatus}
							class="rounded-full clay-button-primary bg-primary py-3.5 font-headline font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
						>
							{checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}
						</button>
						<button
							type="button"
							onclick={goToPendingPage}
							class="rounded-full bg-surface-container-high py-3.5 font-headline font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
						>
							Lanjutkan Nanti
						</button>
					</div>
				{/if}

				{#if modalInfo}
					<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700">
						{modalInfo}
					</div>
				{/if}
				{#if modalError}
					<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
						{modalError}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
