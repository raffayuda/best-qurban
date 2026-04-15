<script lang="ts">
	import { dashboardCustomers, dashboardOrders } from '$lib/stores/dashboardData';

	let customers = $derived($dashboardCustomers);
	let orders = $derived($dashboardOrders);
	let searchQuery = $state('');
	let selectedCustomer = $state<(typeof customers)[0] | null>(null);
	let editingNotes = $state('');

	const filtered = $derived(
		customers.filter((c) => {
			return (
				!searchQuery ||
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.phone.includes(searchQuery)
			);
		})
	);

	function getCustomerOrders(orderIds: string[]) {
		return orders.filter((o) => orderIds.includes(o.id));
	}

	const statusLabel: Record<string, { label: string; cls: string }> = {
		menunggu_pembayaran: { label: 'Menunggu Bayar', cls: 'bg-amber-100 text-amber-800' },
		dibayar: { label: 'Dibayar', cls: 'bg-blue-100 text-blue-800' },
		perawatan: { label: 'Perawatan', cls: 'bg-purple-100 text-purple-800' },
		penyembelihan: { label: 'Penyembelihan', cls: 'bg-orange-100 text-orange-800' },
		dokumentasi: { label: 'Dokumentasi', cls: 'bg-teal-100 text-teal-800' },
		selesai: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-800' },
		gagal: { label: 'Gagal', cls: 'bg-red-100 text-red-800' }
	};

	function fmt(n: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
	}

	function openCustomer(c: (typeof customers)[0]) {
		selectedCustomer = c;
		editingNotes = c.notes;
	}

	function saveNotes() {
		if (selectedCustomer) {
			dashboardCustomers.updateNotes(selectedCustomer.id, editingNotes);
			selectedCustomer = { ...selectedCustomer, notes: editingNotes };
		}
	}

	function getTotalSpent(orderIds: string[]) {
		return getCustomerOrders(orderIds)
			.filter((o) => o.paymentStatus === 'success')
			.reduce((sum, o) => sum + o.total, 0);
	}
</script>

<svelte:head>
	<title>Pelanggan | Dashboard</title>
</svelte:head>

<div class="space-y-6 max-w-7xl">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-black text-on-surface tracking-tighter font-headline">Pelanggan</h1>
		<p class="text-on-surface-variant font-medium mt-1">{customers.length} pelanggan terdaftar</p>
	</div>

	<!-- Search -->
	<div class="clay-card bg-white rounded-2xl p-4">
		<div class="relative">
			<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama, email, atau nomor telepon..."
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
			/>
		</div>
	</div>

	<!-- Customer Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
		{#each filtered as customer (customer.id)}
			{@const customerOrders = getCustomerOrders(customer.orderIds)}
			{@const totalSpent = getTotalSpent(customer.orderIds)}
			<button
				onclick={() => openCustomer(customer)}
				class="clay-card bg-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-all group"
			>
				<div class="flex items-start gap-3 mb-4">
					<div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-primary text-xl">person</span>
					</div>
					<div class="flex-1 min-w-0">
						<p class="font-bold text-on-surface truncate">{customer.name}</p>
						<p class="text-sm text-on-surface-variant truncate">{customer.email}</p>
						<p class="text-sm text-on-surface-variant">{customer.phone}</p>
					</div>
				</div>

				<div class="flex items-center justify-between text-sm border-t border-surface-container pt-3">
					<div>
						<p class="text-xs text-on-surface-variant font-medium">Total Pesanan</p>
						<p class="font-black text-on-surface">{customerOrders.length}x</p>
					</div>
					<div class="text-right">
						<p class="text-xs text-on-surface-variant font-medium">Total Belanja</p>
						<p class="font-black text-primary">{fmt(totalSpent)}</p>
					</div>
				</div>

				{#if customer.notes}
					<div class="mt-3 flex items-start gap-2 bg-amber-50 rounded-lg p-2">
						<span class="material-symbols-outlined text-amber-600 text-sm mt-0.5">sticky_note_2</span>
						<p class="text-xs text-amber-800 font-medium">{customer.notes}</p>
					</div>
				{/if}
			</button>
		{:else}
			<div class="col-span-full text-center py-12 text-on-surface-variant font-medium">
				<span class="material-symbols-outlined text-4xl mb-2 block">group_off</span>
				Tidak ada pelanggan yang cocok.
			</div>
		{/each}
	</div>
</div>

<!-- Customer Detail Modal -->
{#if selectedCustomer}
	{@const custOrders = getCustomerOrders(selectedCustomer.orderIds)}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
		<div class="w-full max-w-xl bg-white rounded-2xl clay-card overflow-hidden max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between px-6 py-5 border-b border-surface-container">
				<h3 class="font-headline text-xl font-black text-on-surface">Detail Pelanggan</h3>
				<button onclick={() => (selectedCustomer = null)} class="p-2 rounded-xl hover:bg-surface-container transition-colors">
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<div class="overflow-y-auto flex-1 p-6 space-y-6">
				<!-- Contact Info -->
				<div class="bg-surface-container-lowest rounded-xl p-4 space-y-3">
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Informasi Kontak</p>
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-primary text-base">person</span>
							<span class="font-bold text-on-surface">{selectedCustomer.name}</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-primary text-base">mail</span>
							<a href="mailto:{selectedCustomer.email}" class="text-primary hover:underline">{selectedCustomer.email}</a>
						</div>
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-primary text-base">phone</span>
							<a href="tel:{selectedCustomer.phone}" class="text-on-surface font-medium">{selectedCustomer.phone}</a>
						</div>
						<div class="flex items-start gap-3">
							<span class="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
							<span class="text-on-surface">{selectedCustomer.address}</span>
						</div>
					</div>
				</div>

				<!-- Order History -->
				<div>
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Riwayat Pesanan ({custOrders.length})</p>
					{#if custOrders.length === 0}
						<p class="text-sm text-on-surface-variant text-center py-4">Belum ada pesanan.</p>
					{:else}
						<div class="space-y-2">
							{#each custOrders as order}
								<div class="bg-surface-container-lowest rounded-xl p-4">
									<div class="flex justify-between items-start mb-2">
										<span class="font-mono text-xs text-primary font-bold">{order.id.slice(-12)}</span>
										<span class="px-2 py-0.5 rounded-full text-xs font-bold {statusLabel[order.status]?.cls}">
											{statusLabel[order.status]?.label}
										</span>
									</div>
									<p class="text-sm font-medium text-on-surface">{order.items.map(i => i.animalName).join(', ')}</p>
									<p class="text-sm font-black text-primary mt-1">{fmt(order.total)}</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Notes -->
				<div class="bg-surface-container-lowest rounded-xl p-4">
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Catatan Internal</p>
					<textarea
						bind:value={editingNotes}
						rows="3"
						placeholder="Tambahkan catatan internal tentang pelanggan ini..."
						class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary resize-none bg-white"
					></textarea>
				</div>
			</div>

			<div class="flex gap-3 px-6 py-4 border-t border-surface-container">
				<button onclick={() => (selectedCustomer = null)} class="flex-1 py-2.5 rounded-xl border border-surface-container-high font-bold text-sm text-on-surface hover:bg-surface-container transition-colors">Tutup</button>
				<button onclick={saveNotes} class="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm clay-button-primary hover:scale-[1.02] transition-transform">Simpan Catatan</button>
			</div>
		</div>
	</div>
{/if}
