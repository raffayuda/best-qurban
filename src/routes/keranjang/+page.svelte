<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, inView } from 'motion';
	import { cart, cartTotal, cartItemCount } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import type { CartItem } from '$lib/stores/cart';

	let summaryRef: HTMLElement;
	let itemsRef: HTMLElement;
	let scrollProgress = 0;
	let selectedIds = $state<number[]>([]);
	let selectionInitialized = $state(false);

	let subtotal = $derived($cartTotal);
	let tax = $derived(Math.round(subtotal * 0.01)); // 1% admin fee
	let total = $derived(subtotal + tax);
	let selectedItems = $derived($cart.filter((item) => selectedIds.includes(item.id)));
	let selectedSubtotal = $derived(
		selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);
	let selectedTax = $derived(Math.round(selectedSubtotal * 0.01));
	let selectedTotal = $derived(selectedSubtotal + selectedTax);

	$effect(() => {
		const cartIds = $cart.map((item) => item.id);
		
		untrack(() => {
			let newSelectedIds = selectedIds.filter((id) => cartIds.includes(id));
			let changed = false;

			if (!selectionInitialized && cartIds.length > 0) {
				newSelectedIds = [...cartIds];
				selectionInitialized = true;
				changed = true;
			} else if (cartIds.length === 0 && selectionInitialized) {
				selectionInitialized = false;
				changed = true;
			} else if (newSelectedIds.length !== selectedIds.length) {
				changed = true;
			}

			if (changed) {
				selectedIds = newSelectedIds;
			}
		});
	});

	function formatPrice(price: number): string {
		return 'Rp ' + price.toLocaleString('id-ID');
	}

	function updateQuantity(id: number, quantity: number) {
		if (quantity <= 0) {
			cart.removeItem(id);
		} else {
			cart.updateQuantity(id, quantity);
		}
	}

	function removeItem(id: number) {
		cart.removeItem(id);
	}

	function clearCart() {
		if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
			cart.clear();
		}
	}

	function isAllSelected(): boolean {
		return $cart.length > 0 && selectedIds.length === $cart.length;
	}

	function toggleSelectAll() {
		if (isAllSelected()) {
			selectedIds = [];
			return;
		}

		selectedIds = $cart.map((item) => item.id);
	}

	function toggleItemSelection(id: number) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
			return;
		}

		selectedIds = [...selectedIds, id];
	}

	function saveCheckoutSelection(mode: 'all' | 'selected', ids: number[]) {
		if (typeof window === 'undefined') return;

		sessionStorage.setItem(
			'checkoutSelection',
			JSON.stringify({
				mode,
				itemIds: ids
			})
		);
	}

	function checkoutSelected() {
		if (selectedItems.length === 0) return;

		saveCheckoutSelection(
			'selected',
			selectedItems.map((item) => item.id)
		);
		goto('/checkout');
	}

	function checkoutAll() {
		if ($cart.length === 0) return;

		saveCheckoutSelection(
			'all',
			$cart.map((item) => item.id)
		);
		goto('/checkout');
	}

	onMount(() => {
		// Animate sections
		if (itemsRef) {
			animate(itemsRef, { opacity: [0, 1], y: [40, 0] } as any, { duration: 0.8, easing: 'ease-out' });
		}

		if (summaryRef) {
			animate(summaryRef, { opacity: [0, 1], x: [40, 0] } as any, { duration: 0.8, easing: 'ease-out' });
		}

		// Scroll progress
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', () => {
				const scrollTop = window.scrollY;
				const docHeight = document.documentElement.scrollHeight - window.innerHeight;
				scrollProgress = scrollTop / docHeight;
			});
		}
	});
</script>

<!-- Scroll Progress Indicator -->
<div class="fixed top-0 left-0 z-[60] h-1 w-full">
	<div class="h-full bg-gradient-to-r from-primary via-secondary-container to-primary" style="width: {scrollProgress * 100}%; transition: width 0.1s ease-out;"></div>
</div>

<div class="px-4 md:px-12 max-w-7xl mx-auto pb-20">
	<!-- Hero Header -->
	<div class="mb-12 rounded-xl clay-card bg-surface-container-low p-10">
		<div class="flex items-center gap-4 mb-4">
			<span class="material-symbols-outlined text-4xl text-primary">shopping_cart</span>
			<h1 class="font-headline text-4xl font-black text-on-surface tracking-tighter md:text-5xl">Keranjang Belanja</h1>
		</div>
		<p class="text-on-surface-variant font-medium text-lg">
			{#if $cart.length > 0}
				{$cartItemCount} hewan dalam keranjang Anda
			{:else}
				Keranjang Anda masih kosong
			{/if}
		</p>
	</div>

	{#if $cart.length > 0}
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
			<!-- Cart Items -->
			<div bind:this={itemsRef} class="lg:col-span-2 space-y-6 opacity-0">
				<div class="flex items-center justify-between mb-6">
					<h2 class="font-headline text-2xl font-bold text-on-surface">Hewan Pilihan Anda</h2>
					<div class="flex items-center gap-4">
						<label class="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
							<input
								type="checkbox"
								checked={isAllSelected()}
								onchange={toggleSelectAll}
								class="h-4 w-4 rounded border-surface-container-high"
							/>
							Pilih Semua
						</label>
						<button onclick={clearCart} class="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
							<span class="material-symbols-outlined text-sm">delete_sweep</span>
							Kosongkan Keranjang
						</button>
					</div>
				</div>

				{#each $cart as item}
					<div class="clay-card bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 group hover:-translate-y-1 transition-transform duration-300">
						<div class="pt-1">
							<input
								type="checkbox"
								checked={selectedIds.includes(item.id)}
								onchange={() => toggleItemSelection(item.id)}
								class="h-5 w-5 rounded border-surface-container-high"
							/>
						</div>

						<!-- Item Image -->
						<div class="w-full sm:w-40 h-40 rounded-xl overflow-hidden clay-recessed flex-shrink-0">
							<img alt={item.name} class="w-full h-full object-cover" src={item.image} />
						</div>

						<!-- Item Details -->
						<div class="flex-1 flex flex-col justify-between">
							<div>
								<div class="flex items-start justify-between mb-2">
									<div>
										<h3 class="font-headline text-2xl font-black text-on-surface">{item.name}</h3>
										<span class="font-label text-sm font-bold text-emerald-700">{item.weight}</span>
									</div>
									<button onclick={() => removeItem(item.id)} class="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600">
										<span class="material-symbols-outlined">delete</span>
									</button>
								</div>
								<p class="font-headline text-xl font-black text-primary mb-4">{formatPrice(item.price)}</p>
							</div>

							<!-- Quantity Controls -->
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3 clay-recessed rounded-full bg-white p-1">
									<button 
										onclick={() => updateQuantity(item.id, item.quantity - 1)}
										class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors font-bold"
									>
										<span class="material-symbols-outlined text-lg">remove</span>
									</button>
									<span class="w-12 text-center font-headline font-bold text-lg">{item.quantity}</span>
									<button 
										onclick={() => updateQuantity(item.id, item.quantity + 1)}
										class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity"
									>
										<span class="material-symbols-outlined text-lg">add</span>
									</button>
								</div>

								<!-- Subtotal for this item -->
								<div class="text-right">
									<p class="text-xs text-on-surface-variant font-medium">Subtotal</p>
									<p class="font-headline text-xl font-black text-on-surface">{formatPrice(item.price * item.quantity)}</p>
								</div>
							</div>
						</div>
					</div>
				{/each}

				<!-- Continue Shopping -->
				<a href="/hewan" class="inline-flex items-center gap-3 font-headline font-bold text-primary hover:gap-4 transition-all mt-8">
					<span class="material-symbols-outlined">arrow_back</span>
					Lanjut Belanja Hewan Kurban
				</a>
			</div>

			<!-- Order Summary -->
			<div bind:this={summaryRef} class="lg:col-span-1 opacity-0">
				<div class="clay-card bg-surface-container-lowest rounded-xl p-8 sticky top-32">
					<h3 class="font-headline text-2xl font-black text-on-surface mb-6 tracking-tighter">Ringkasan Pesanan</h3>
					<p class="mb-4 text-sm font-medium text-on-surface-variant">
						{selectedItems.length} hewan dipilih untuk checkout
					</p>
					
					<div class="space-y-4 mb-6">
						<div class="flex justify-between text-on-surface-variant">
							<span class="font-medium">Subtotal ({$cart.length} hewan)</span>
							<span class="font-bold">{formatPrice(subtotal)}</span>
						</div>
						<div class="flex justify-between text-on-surface-variant">
							<span class="font-medium">Subtotal Terpilih</span>
							<span class="font-bold text-primary">{formatPrice(selectedSubtotal)}</span>
						</div>
						<div class="flex justify-between text-on-surface-variant">
							<span class="font-medium">Biaya Admin (1%)</span>
							<span class="font-bold">{formatPrice(selectedTax)}</span>
						</div>
						<div class="h-px bg-surface-container"></div>
						<div class="flex justify-between text-on-surface">
							<span class="font-bold text-lg">Total Terpilih</span>
							<span class="font-headline text-2xl font-black text-primary">{formatPrice(selectedTotal)}</span>
						</div>
					</div>

					<!-- Promo Code -->
					<div class="mb-6 clay-recessed rounded-full bg-white p-1">
						<input class="w-full bg-transparent border-none px-4 py-3 font-medium focus:ring-0" placeholder="Kode Promo (opsional)" type="text" />
					</div>

					<div class="space-y-3 mb-4">
						<button
							onclick={checkoutSelected}
							disabled={selectedItems.length === 0}
							class="w-full clay-button-primary bg-primary text-on-primary py-4 rounded-full font-headline font-bold text-base transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Checkout Hewan Terpilih
						</button>
						<button
							onclick={checkoutAll}
							class="w-full bg-surface-container-high text-on-surface py-4 rounded-full font-headline font-bold text-base transition-colors hover:bg-surface-container"
						>
							Checkout Semua Hewan
						</button>
					</div>

					<!-- Trust Badges -->
					<div class="space-y-3 mt-6 pt-6 border-t border-surface-container">
						<div class="flex items-center gap-3 text-sm text-on-surface-variant">
							<span class="material-symbols-outlined text-primary text-lg">verified</span>
							<span class="font-medium">Garansi hewan sehat</span>
						</div>
						<div class="flex items-center gap-3 text-sm text-on-surface-variant">
							<span class="material-symbols-outlined text-primary text-lg">local_shipping</span>
							<span class="font-medium">Gratis ongkir Jakarta & sekitarnya</span>
						</div>
						<div class="flex items-center gap-3 text-sm text-on-surface-variant">
							<span class="material-symbols-outlined text-primary text-lg">videocam</span>
							<span class="font-medium">Video dokumentasi lengkap</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Empty Cart State -->
		<div class="text-center py-20 clay-card bg-surface-container-low rounded-xl">
			<span class="material-symbols-outlined text-8xl text-primary/30 mb-6 inline-block">shopping_cart_checkout</span>
			<h2 class="font-headline text-3xl font-black text-on-surface mb-4">Keranjang Anda Kosong</h2>
			<p class="text-on-surface-variant font-medium text-lg mb-8 max-w-md mx-auto">
				Mulai pilih hewan kurban terbaik untuk ibadah Anda. Kami menyediakan sapi, domba, dan kambing berkualitas premium.
			</p>
			<a href="/hewan" class="inline-flex items-center gap-3 clay-button-primary bg-primary text-on-primary px-10 py-5 rounded-full font-headline font-bold text-lg transition-transform hover:scale-105">
				<span class="material-symbols-outlined">pets</span>
				Pilih Hewan Kurban
			</a>
		</div>
	{/if}
</div>
