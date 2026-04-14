<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import type { CartItem } from '$lib/stores/cart';

	let selectedIds = $state<number[]>([]);
	let selectionInitialized = $state(false);

	$effect(() => {
		const cartIds = $cart.map((item) => item.id);
		selectedIds = selectedIds.filter((id) => cartIds.includes(id));

		if (!selectionInitialized && cartIds.length > 0) {
			selectedIds = [...cartIds];
			selectionInitialized = true;
		}

		if (cartIds.length === 0) {
			selectionInitialized = false;
		}
	});

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function getTotal(items: CartItem[]): number {
		return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	}

	function getSelectedItems(): CartItem[] {
		return $cart.filter((item) => selectedIds.includes(item.id));
	}

	function isAllSelected(): boolean {
		return $cart.length > 0 && selectedIds.length === $cart.length;
	}

	function toggleItemSelection(id: number) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
			return;
		}

		selectedIds = [...selectedIds, id];
	}

	function toggleSelectAll() {
		if (isAllSelected()) {
			selectedIds = [];
			return;
		}

		selectedIds = $cart.map((item) => item.id);
	}

	function handleQuantityChange(item: CartItem, newQuantity: number) {
		cart.updateQuantity(item.id, newQuantity);
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

	function handleCheckoutSelected() {
		const selectedItems = getSelectedItems();
		if (selectedItems.length === 0) return;

		saveCheckoutSelection(
			'selected',
			selectedItems.map((item) => item.id)
		);
		goto('/checkout');
	}

	function handleCheckoutAll() {
		if ($cart.length === 0) return;

		saveCheckoutSelection(
			'all',
			$cart.map((item) => item.id)
		);
		goto('/checkout');
	}
</script>

<svelte:head>
	<title>Shopping Cart - TestStore</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

	{#if $cart.length === 0}
		<div class="bg-white rounded-lg shadow-md p-12 text-center">
			<span class="text-6xl mb-4 block">🛒</span>
			<h2 class="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
			<p class="text-gray-600 mb-6">Add some products to get started!</p>
			<a
				href="/"
				class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
			>
				Browse Products
			</a>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md overflow-hidden">
			<div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
				<label class="flex items-center gap-3 text-sm font-medium text-gray-700">
					<input
						type="checkbox"
						checked={isAllSelected()}
						onchange={toggleSelectAll}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					Pilih semua hewan ({$cart.length})
				</label>
				<span class="text-sm text-gray-600">Dipilih: {selectedIds.length}</span>
			</div>

			<div class="divide-y divide-gray-200">
				{#each $cart as item (item.id)}
					<div class="p-6 flex items-center gap-4">
						<input
							type="checkbox"
							checked={selectedIds.includes(item.id)}
							onchange={() => toggleItemSelection(item.id)}
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>

						<div class="bg-linear-to-br from-blue-50 to-purple-50 w-20 h-20 rounded-lg flex items-center justify-center shrink-0">
							<span class="text-4xl">{item.image}</span>
						</div>
						
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-gray-900">{item.name}</h3>
							<p class="text-sm text-gray-500">{item.id}</p>
							<p class="text-lg font-bold text-gray-900 mt-1">
								{formatPrice(item.price)}
							</p>
						</div>
						
						<div class="flex items-center gap-3">
							<button
								onclick={() => handleQuantityChange(item, item.quantity - 1)}
								class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
							>
								-
							</button>
							<span class="w-12 text-center font-semibold">{item.quantity}</span>
							<button
								onclick={() => handleQuantityChange(item, item.quantity + 1)}
								class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
							>
								+
							</button>
						</div>
						
						<div class="text-right min-w-25">
							<p class="text-lg font-bold text-gray-900">
								{formatPrice(item.price * item.quantity)}
							</p>
						</div>
						
						<button
							onclick={() => cart.removeItem(item.id)}
							class="text-red-500 hover:text-red-700 transition ml-4"
						>
							✕
						</button>
					</div>
				{/each}
			</div>
			
			<div class="bg-gray-50 p-6">
				<div class="flex justify-between items-center mb-4">
					<span class="text-lg text-gray-600">Subtotal</span>
					<span class="text-2xl font-bold text-gray-900">
						{formatPrice(getTotal($cart))}
					</span>
				</div>
				<div class="flex justify-between items-center mb-4">
					<span class="text-lg text-gray-600">Subtotal Terpilih</span>
					<span class="text-xl font-bold text-blue-600">
						{formatPrice(getTotal(getSelectedItems()))}
					</span>
				</div>
				<div class="flex justify-between items-center mb-6">
					<span class="text-sm text-gray-500">Shipping</span>
					<span class="text-sm text-gray-500">Free</span>
				</div>
				<div class="border-t pt-4 mb-6">
					<div class="flex justify-between items-center">
						<span class="text-xl font-bold text-gray-900">Total</span>
						<span class="text-3xl font-bold text-blue-600">
							{formatPrice(getTotal($cart))}
						</span>
					</div>
				</div>
				
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<button
						onclick={handleCheckoutSelected}
						disabled={getSelectedItems().length === 0}
						class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-base"
					>
						Checkout Hewan Terpilih ({getSelectedItems().length})
					</button>
					<button
						onclick={handleCheckoutAll}
						class="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-base"
					>
						Checkout Semua Hewan
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
