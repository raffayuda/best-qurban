<script lang="ts">
	import { dashboardOrders, type Order, type PaymentStatus } from '$lib/stores/dashboardData';

	let orders = $derived($dashboardOrders);
	let filterPayment = $state<PaymentStatus | 'semua'>('semua');
	let searchQuery = $state('');

	const filtered = $derived(
		orders.filter((o) => {
			const matchSearch =
				!searchQuery ||
				o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
			const matchStatus = filterPayment === 'semua' || o.paymentStatus === filterPayment;
			return matchSearch && matchStatus;
		}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	);

	const successOrders = $derived(orders.filter((o) => o.paymentStatus === 'success'));
	const pendingOrders = $derived(orders.filter((o) => o.paymentStatus === 'pending'));
	const failedOrders = $derived(orders.filter((o) => o.paymentStatus === 'failed'));

	const totalRevenue = $derived(successOrders.reduce((s, o) => s + o.total, 0));
	const totalAdminFee = $derived(successOrders.reduce((s, o) => s + o.adminFee, 0));
	const avgOrderValue = $derived(successOrders.length > 0 ? totalRevenue / successOrders.length : 0);

	function fmt(n: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
	}

	function fmtDate(s: string) {
		return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	const paymentConfig: Record<PaymentStatus, { label: string; cls: string }> = {
		success: { label: 'Sukses', cls: 'bg-emerald-100 text-emerald-800' },
		pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800' },
		failed: { label: 'Gagal', cls: 'bg-red-100 text-red-800' }
	};

	function handleExport() {
		// Dummy export - create CSV
		const rows = [
			['ID Pesanan', 'Pemesan', 'Total', 'Biaya Admin', 'Status Bayar', 'Channel', 'Tanggal'],
			...filtered.map((o) => [
				o.id,
				o.customerName,
				o.total.toString(),
				o.adminFee.toString(),
				o.paymentStatus,
				o.paymentChannel,
				fmtDate(o.createdAt)
			])
		];
		const csv = rows.map((r) => r.join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `laporan-keuangan-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Keuangan | Dashboard</title>
</svelte:head>

<div class="space-y-6 max-w-7xl">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-black text-on-surface tracking-tighter font-headline">Keuangan</h1>
			<p class="text-on-surface-variant font-medium mt-1">Rekonsiliasi & laporan pembayaran</p>
		</div>
		<button
			onclick={handleExport}
			class="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-headline font-bold text-sm clay-button-primary transition-transform hover:scale-105 shrink-0"
		>
			<span class="material-symbols-outlined text-base">download</span>
			Export CSV
		</button>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="clay-card bg-white rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
					<span class="material-symbols-outlined text-emerald-600 text-2xl">trending_up</span>
				</div>
				<div>
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Pendapatan</p>
					<span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{successOrders.length} transaksi</span>
				</div>
			</div>
			<p class="text-2xl font-black text-primary font-headline">{fmt(totalRevenue)}</p>
			<p class="text-sm text-on-surface-variant mt-1">Biaya Admin: <span class="font-bold text-on-surface">{fmt(totalAdminFee)}</span></p>
		</div>

		<div class="clay-card bg-white rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
					<span class="material-symbols-outlined text-amber-600 text-2xl">hourglass</span>
				</div>
				<div>
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Menunggu</p>
					<span class="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingOrders.length} transaksi</span>
				</div>
			</div>
			<p class="text-2xl font-black text-on-surface font-headline">
				{fmt(pendingOrders.reduce((s, o) => s + o.total, 0))}
			</p>
			<p class="text-sm text-on-surface-variant mt-1">Menunggu konfirmasi pembayaran</p>
		</div>

		<div class="clay-card bg-white rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
					<span class="material-symbols-outlined text-red-500 text-2xl">cancel</span>
				</div>
				<div>
					<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gagal</p>
					<span class="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{failedOrders.length} transaksi</span>
				</div>
			</div>
			<p class="text-2xl font-black text-on-surface font-headline">
				{fmt(failedOrders.reduce((s, o) => s + o.total, 0))}
			</p>
			<p class="text-sm text-on-surface-variant mt-1">Rata-rata per order: <span class="font-bold text-on-surface">{fmt(avgOrderValue)}</span></p>
		</div>
	</div>

	<!-- Revenue by Channel -->
	<div class="clay-card bg-white rounded-2xl p-6">
		<h2 class="font-headline font-black text-lg text-on-surface mb-4">Pendapatan per Channel</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each ['GoPay', 'OVO', 'Dana', 'LinkAja', 'BCA Mobile'] as channel}
				{@const channelTotal = successOrders.filter(o => o.paymentChannel === channel).reduce((s, o) => s + o.total, 0)}
				{@const channelCount = successOrders.filter(o => o.paymentChannel === channel).length}
				{#if channelCount > 0}
					<div class="bg-surface-container-lowest rounded-xl p-4">
						<p class="font-bold text-on-surface text-sm">{channel}</p>
						<p class="text-xl font-black text-primary font-headline mt-1">{fmt(channelTotal)}</p>
						<p class="text-xs text-on-surface-variant">{channelCount} transaksi</p>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Filters -->
	<div class="clay-card bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
		<div class="flex-1 relative">
			<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari ID pesanan atau nama pemesan..."
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
			/>
		</div>
		<div class="flex gap-2">
			{#each (['semua', 'success', 'pending', 'failed'] as const) as status}
				<button
					onclick={() => (filterPayment = status)}
					class="px-4 py-2 rounded-xl font-bold text-sm transition-all {filterPayment === status
						? 'bg-primary text-on-primary'
						: 'border border-surface-container-high text-on-surface-variant hover:bg-surface-container'}"
				>
					{status === 'semua' ? 'Semua' : status === 'success' ? 'Sukses' : status === 'pending' ? 'Pending' : 'Gagal'}
				</button>
			{/each}
		</div>
	</div>

	<!-- Transaction Table -->
	<div class="clay-card bg-white rounded-2xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-surface-container-lowest border-b border-surface-container">
					<tr>
						<th class="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">ID Transaksi</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Pemesan</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden md:table-cell">Channel</th>
						<th class="text-right px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Total</th>
						<th class="text-right px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden lg:table-cell">Biaya Admin</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden xl:table-cell">Tanggal</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-container">
					{#each filtered as order (order.id)}
						<tr class="hover:bg-surface-container-lowest/50 transition-colors">
							<td class="px-6 py-4">
								<span class="font-mono text-xs font-bold text-primary">{order.id.slice(-12)}</span>
							</td>
							<td class="px-4 py-4 font-medium text-on-surface">{order.customerName}</td>
							<td class="px-4 py-4 text-on-surface-variant hidden md:table-cell">{order.paymentChannel}</td>
							<td class="px-4 py-4 text-right font-bold text-on-surface">{fmt(order.total)}</td>
							<td class="px-4 py-4 text-right font-medium text-on-surface-variant hidden lg:table-cell">{fmt(order.adminFee)}</td>
							<td class="px-4 py-4">
								<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold {paymentConfig[order.paymentStatus]?.cls}">
									{paymentConfig[order.paymentStatus]?.label}
								</span>
							</td>
							<td class="px-4 py-4 text-on-surface-variant hidden xl:table-cell">{fmtDate(order.createdAt)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center text-on-surface-variant font-medium">
								<span class="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
								Tidak ada transaksi yang cocok.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
