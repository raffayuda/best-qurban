<script lang="ts">
	import { dashboardOrders, type Order, type OrderStatus } from '$lib/stores/dashboardData';

	let orders = $derived($dashboardOrders);
	let searchQuery = $state('');
	let filterStatus = $state<OrderStatus | 'semua'>('semua');
	let selectedOrder = $state<Order | null>(null);
	let newStatus = $state<OrderStatus | ''>('');
	let newNotes = $state('');

	const ORDER_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
		{ key: 'menunggu_pembayaran', label: 'Menunggu Pembayaran', icon: 'payments' },
		{ key: 'dibayar', label: 'Pembayaran Diterima', icon: 'check_circle' },
		{ key: 'perawatan', label: 'Perawatan Hewan', icon: 'spa' },
		{ key: 'penyembelihan', label: 'Penyembelihan', icon: 'routine' },
		{ key: 'dokumentasi', label: 'Dokumentasi', icon: 'auto_videocam' },
		{ key: 'selesai', label: 'Selesai', icon: 'verified' }
	];

	const statusConfig: Record<OrderStatus, { label: string; cls: string }> = {
		menunggu_pembayaran: { label: 'Menunggu Bayar', cls: 'bg-amber-100 text-amber-800' },
		dibayar: { label: 'Dibayar', cls: 'bg-blue-100 text-blue-800' },
		perawatan: { label: 'Perawatan', cls: 'bg-purple-100 text-purple-800' },
		penyembelihan: { label: 'Penyembelihan', cls: 'bg-orange-100 text-orange-800' },
		dokumentasi: { label: 'Dokumentasi', cls: 'bg-teal-100 text-teal-800' },
		selesai: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-800' },
		gagal: { label: 'Gagal', cls: 'bg-red-100 text-red-800' }
	};

	const paymentStatusConfig = {
		success: { label: 'Sukses', cls: 'bg-emerald-100 text-emerald-800' },
		pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800' },
		failed: { label: 'Gagal', cls: 'bg-red-100 text-red-800' }
	};

	const filtered = $derived(
		orders.filter((o) => {
			const matchSearch =
				!searchQuery ||
				o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
			const matchStatus = filterStatus === 'semua' || o.status === filterStatus;
			return matchSearch && matchStatus;
		}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	);

	function fmt(n: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
	}

	function fmtDate(s: string) {
		return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function openDetail(order: Order) {
		selectedOrder = order;
		newStatus = order.status;
		newNotes = order.notes;
	}

	function saveOrderChanges() {
		if (!selectedOrder) return;
		if (newStatus && newStatus !== selectedOrder.status) {
			dashboardOrders.updateStatus(selectedOrder.id, newStatus as OrderStatus);
		}
		if (newNotes !== selectedOrder.notes) {
			dashboardOrders.updateNotes(selectedOrder.id, newNotes);
		}
		// Refresh the local view
		selectedOrder = { ...selectedOrder, status: newStatus as OrderStatus, notes: newNotes };
	}

	function getStepIndex(status: OrderStatus): number {
		const idx = ORDER_STEPS.findIndex((s) => s.key === status);
		return idx === -1 ? 0 : idx;
	}
</script>

<svelte:head>
	<title>Pesanan | Dashboard</title>
</svelte:head>

<div class="space-y-6 max-w-7xl">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-black text-on-surface tracking-tighter font-headline">Pesanan</h1>
		<p class="text-on-surface-variant font-medium mt-1">{orders.length} total pesanan</p>
	</div>

	<!-- Status Summary -->
	<div class="grid grid-cols-3 md:grid-cols-6 gap-3">
		{#each (['menunggu_pembayaran', 'dibayar', 'perawatan', 'penyembelihan', 'dokumentasi', 'selesai'] as OrderStatus[]) as status}
			<button
				onclick={() => filterStatus = filterStatus === status ? 'semua' : status}
				class="clay-card bg-white rounded-xl p-3 text-left transition-all hover:scale-105 {filterStatus === status ? 'ring-2 ring-primary' : ''}"
			>
				<p class="text-xl font-black text-on-surface font-headline">{orders.filter(o => o.status === status).length}</p>
				<p class="text-xs font-bold mt-1 {statusConfig[status].cls.split(' ')[1]}">{statusConfig[status].label}</p>
			</button>
		{/each}
	</div>

	<!-- Filters -->
	<div class="clay-card bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
		<div class="flex-1 relative">
			<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari ID pesanan, nama, atau email pemesan..."
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
			/>
		</div>
		<select
			bind:value={filterStatus}
			class="px-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
		>
			<option value="semua">Semua Status</option>
			{#each ORDER_STEPS as step}
				<option value={step.key}>{step.label}</option>
			{/each}
			<option value="gagal">Gagal</option>
		</select>
	</div>

	<!-- Orders Table -->
	<div class="clay-card bg-white rounded-2xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-surface-container-lowest border-b border-surface-container">
					<tr>
						<th class="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">ID Pesanan</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Pemesan</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden md:table-cell">Item</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden lg:table-cell">Total</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden xl:table-cell">Pembayaran</th>
						<th class="text-right px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-container">
					{#each filtered as order (order.id)}
						<tr class="hover:bg-surface-container-lowest/50 transition-colors">
							<td class="px-6 py-4">
								<span class="font-mono text-xs font-bold text-primary">{order.id.slice(-12)}</span>
								<p class="text-xs text-on-surface-variant mt-0.5">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
							</td>
							<td class="px-4 py-4">
								<p class="font-bold text-on-surface">{order.customerName}</p>
								<p class="text-xs text-on-surface-variant">{order.customerPhone}</p>
							</td>
							<td class="px-4 py-4 hidden md:table-cell">
								<p class="text-on-surface">{order.items.map(i => i.animalName).join(', ')}</p>
								<p class="text-xs text-on-surface-variant">{order.items.length} item</p>
							</td>
							<td class="px-4 py-4 font-bold text-on-surface hidden lg:table-cell">{fmt(order.total)}</td>
							<td class="px-4 py-4">
								<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold {statusConfig[order.status]?.cls}">
									{statusConfig[order.status]?.label}
								</span>
							</td>
							<td class="px-4 py-4 hidden xl:table-cell">
								<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold {paymentStatusConfig[order.paymentStatus]?.cls}">
									{paymentStatusConfig[order.paymentStatus]?.label}
								</span>
								<p class="text-xs text-on-surface-variant mt-0.5">{order.paymentChannel}</p>
							</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => openDetail(order)}
									class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
								>
									<span class="material-symbols-outlined text-sm">open_in_new</span>
									Detail
								</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center text-on-surface-variant font-medium">
								<span class="material-symbols-outlined text-4xl mb-2 block">search_off</span>
								Tidak ada pesanan yang cocok.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Order Detail Modal -->
{#if selectedOrder}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
		<div class="w-full max-w-2xl bg-white rounded-2xl clay-card overflow-hidden max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between px-6 py-5 border-b border-surface-container">
				<div>
					<h3 class="font-headline text-xl font-black text-on-surface">Detail Pesanan</h3>
					<p class="text-xs font-mono text-on-surface-variant mt-0.5">{selectedOrder.id}</p>
				</div>
				<button onclick={() => (selectedOrder = null)} class="p-2 rounded-xl hover:bg-surface-container transition-colors">
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<div class="overflow-y-auto flex-1 p-6 space-y-6">
				<!-- Customer Info -->
				<div class="grid grid-cols-2 gap-4 bg-surface-container-lowest rounded-xl p-4">
					<div>
						<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Pemesan</p>
						<p class="font-bold text-on-surface">{selectedOrder.customerName}</p>
						<p class="text-sm text-on-surface-variant">{selectedOrder.customerEmail}</p>
						<p class="text-sm text-on-surface-variant">{selectedOrder.customerPhone}</p>
					</div>
					<div>
						<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Alamat</p>
						<p class="text-sm text-on-surface">{selectedOrder.customerAddress}</p>
					</div>
				</div>

				<!-- Items -->
				<div>
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Item Pesanan</p>
					<div class="space-y-2">
						{#each selectedOrder.items as item}
							<div class="flex justify-between items-center bg-surface-container-lowest rounded-xl p-3">
								<div>
									<p class="font-bold text-on-surface">{item.animalName}</p>
									<p class="text-sm text-on-surface-variant">Qty: {item.quantity}</p>
								</div>
								<p class="font-bold text-primary">{fmt(item.price * item.quantity)}</p>
							</div>
						{/each}
					</div>
					<div class="border-t border-surface-container pt-3 mt-3 flex justify-between">
						<div>
							<p class="text-sm text-on-surface-variant">Subtotal</p>
							<p class="text-sm text-on-surface-variant">Biaya Admin (1%)</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-bold text-on-surface">{fmt(selectedOrder.total)}</p>
							<p class="text-sm font-bold text-on-surface">{fmt(selectedOrder.adminFee)}</p>
						</div>
					</div>
					<div class="flex justify-between items-center mt-2 pt-2 border-t border-surface-container">
						<p class="font-bold text-on-surface">Total Bayar</p>
						<p class="text-xl font-black text-primary font-headline">{fmt(selectedOrder.total + selectedOrder.adminFee)}</p>
					</div>
				</div>

				<!-- Progress Steps -->
				{#if selectedOrder.status !== 'gagal'}
					<div>
						<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Alur Status</p>
						<div class="flex gap-2 overflow-x-auto pb-2">
							{#each ORDER_STEPS as step, i}
								{@const stepIdx = getStepIndex(selectedOrder.status)}
								{@const isActive = i <= stepIdx}
								{@const isCurrent = i === stepIdx}
								<div class="flex flex-col items-center gap-1 min-w-[80px]">
									<div class="w-10 h-10 rounded-full flex items-center justify-center {isActive ? (isCurrent ? 'bg-secondary-container text-on-secondary-container ring-4 ring-secondary-container/30' : 'bg-primary text-on-primary') : 'bg-surface-container text-on-surface-variant/40'}">
										<span class="material-symbols-outlined text-sm">{isActive && !isCurrent ? 'check' : step.icon}</span>
									</div>
									<p class="text-xs font-bold text-center leading-tight {isActive ? 'text-on-surface' : 'text-on-surface-variant/40'}">{step.label}</p>
								</div>
								{#if i < ORDER_STEPS.length - 1}
									<div class="flex items-center mt-5">
										<div class="h-0.5 w-4 {i < getStepIndex(selectedOrder.status) ? 'bg-primary' : 'bg-surface-container'}"></div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<!-- Update Status -->
				<div class="bg-surface-container-lowest rounded-xl p-4 space-y-4">
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Update Operasional</p>
					<div>
						<label class="text-xs font-bold text-on-surface-variant block mb-1">Ubah Status</label>
						<select bind:value={newStatus} class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary">
							{#each ORDER_STEPS as step}
								<option value={step.key}>{step.label}</option>
							{/each}
							<option value="gagal">Gagal / Batalkan</option>
						</select>
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant block mb-1">Catatan Internal</label>
						<textarea bind:value={newNotes} rows="2" placeholder="Tambahkan catatan operasional..." class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary resize-none"></textarea>
					</div>
				</div>
			</div>

			<div class="flex gap-3 px-6 py-4 border-t border-surface-container">
				<button onclick={() => (selectedOrder = null)} class="flex-1 py-2.5 rounded-xl border border-surface-container-high font-bold text-sm text-on-surface hover:bg-surface-container transition-colors">Tutup</button>
				<button onclick={saveOrderChanges} class="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm clay-button-primary hover:scale-[1.02] transition-transform">Simpan Update</button>
			</div>
		</div>
	</div>
{/if}
