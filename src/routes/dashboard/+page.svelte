<script lang="ts">
	import { dashboardOrders, dashboardAnimals } from '$lib/stores/dashboardData';
	import { isAdmin, auth } from '$lib/stores/auth';
	import { isEditMode } from '$lib/stores/content';
	import { goto } from '$app/navigation';

	const orders = $derived($dashboardOrders);
	const animals = $derived($dashboardAnimals);

	// Stats derived
	const today = new Date().toISOString().split('T')[0];
	const todayOrders = $derived(orders.filter((o) => o.createdAt.startsWith(today)));
	const pendingPayment = $derived(orders.filter((o) => o.status === 'menunggu_pembayaran'));
	const processing = $derived(
		orders.filter((o) => ['dibayar', 'perawatan', 'penyembelihan'].includes(o.status))
	);
	const monthRevenue = $derived(
		orders
			.filter((o) => o.paymentStatus === 'success')
			.reduce((sum, o) => sum + o.total, 0)
	);
	const criticalStock = $derived(animals.filter((a) => a.stock > 0 && a.stock <= 3));
	const recentOrders = $derived([...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6));

	function fmt(n: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(n);
	}

	function fmtDate(s: string) {
		return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

	// Revenue chart data (last 7 days)
	const chartData = $derived(
		(() => {
			const days: { date: string; label: string; revenue: number; max: number }[] = [];
			for (let i = 6; i >= 0; i--) {
				const d = new Date();
				d.setDate(d.getDate() - i);
				const dateStr = d.toISOString().split('T')[0];
				const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
				const revenue = orders
					.filter((o) => o.paymentStatus === 'success' && o.createdAt.startsWith(dateStr))
					.reduce((sum, o) => sum + o.total, 0);
				days.push({ date: dateStr, label, revenue, max: 0 });
			}
			const maxRev = Math.max(...days.map((d) => d.revenue), 1);
			return days.map((d) => ({ ...d, max: maxRev }));
		})()
	);

	function goEditLanding() {
		isEditMode.set(true);
		goto('/');
	}
</script>

<svelte:head>
	<title>Dashboard | Best-Qurban</title>
</svelte:head>

<div class="space-y-8 max-w-7xl">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-black text-on-surface tracking-tighter font-headline">Ringkasan</h1>
			<p class="text-on-surface-variant font-medium mt-1">
				Selamat datang, pantau aktivitas Best-Qurban di sini.
			</p>
		</div>
		{#if $isAdmin}
			<button
				onclick={goEditLanding}
				class="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-full font-headline font-bold text-sm transition-transform hover:scale-105 clay-button-secondary shrink-0"
			>
				<span class="material-symbols-outlined text-base">edit</span>
				Edit Landing Page
			</button>
		{/if}
	</div>

	<!-- Stats Cards -->
	{#if $isAdmin}
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="clay-card bg-white rounded-2xl p-5">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
						<span class="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
					</div>
					<span class="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">Hari ini</span>
				</div>
				<p class="text-3xl font-black text-on-surface font-headline">{todayOrders.length}</p>
				<p class="text-sm font-medium text-on-surface-variant mt-1">Pesanan Hari Ini</p>
			</div>

			<div class="clay-card bg-white rounded-2xl p-5">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
						<span class="material-symbols-outlined text-amber-600 text-2xl">hourglass_empty</span>
					</div>
					<span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Perlu Aksi</span>
				</div>
				<p class="text-3xl font-black text-on-surface font-headline">{pendingPayment.length}</p>
				<p class="text-sm font-medium text-on-surface-variant mt-1">Menunggu Pembayaran</p>
			</div>

			<div class="clay-card bg-white rounded-2xl p-5">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
						<span class="material-symbols-outlined text-blue-600 text-2xl">autorenew</span>
					</div>
					<span class="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Proses</span>
				</div>
				<p class="text-3xl font-black text-on-surface font-headline">{processing.length}</p>
				<p class="text-sm font-medium text-on-surface-variant mt-1">Sedang Diproses</p>
			</div>

			<div class="clay-card bg-white rounded-2xl p-5">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
						<span class="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
					</div>
					<span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Bulan Ini</span>
				</div>
				<p class="text-xl font-black text-primary font-headline">{fmt(monthRevenue)}</p>
				<p class="text-sm font-medium text-on-surface-variant mt-1">Pendapatan</p>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
		<!-- Revenue Chart (Admin) -->
		{#if $isAdmin}
			<div class="xl:col-span-2 clay-card bg-white rounded-2xl p-6">
				<h2 class="font-headline font-black text-lg text-on-surface mb-6">Pendapatan 7 Hari Terakhir</h2>
				<div class="flex items-end gap-2 h-40">
					{#each chartData as day}
						<div class="flex-1 flex flex-col items-center gap-1">
							<div class="w-full flex items-end justify-center" style="height: 120px;">
								<div
									class="w-full rounded-t-lg bg-gradient-to-t from-primary to-emerald-400 transition-all duration-500 min-h-[4px]"
									style="height: {day.revenue > 0 ? Math.max((day.revenue / day.max) * 120, 4) : 4}px;"
									title={fmt(day.revenue)}
								></div>
							</div>
							<span class="text-xs font-bold text-on-surface-variant">{day.label}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Critical Stock Alert -->
		{#if $isAdmin}
			<div class="clay-card bg-white rounded-2xl p-6">
				<div class="flex items-center gap-2 mb-4">
					<span class="material-symbols-outlined text-red-500">warning</span>
					<h2 class="font-headline font-black text-lg text-on-surface">Stok Kritis</h2>
				</div>
				{#if criticalStock.length === 0}
					<div class="text-center py-6">
						<span class="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
						<p class="text-sm text-on-surface-variant font-medium mt-2">Semua stok aman 👍</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each criticalStock as animal}
							<div class="flex items-center gap-3 bg-red-50 rounded-xl p-3">
								<img src={animal.image} alt={animal.name} class="w-10 h-10 rounded-lg object-cover" />
								<div class="flex-1 min-w-0">
									<p class="text-sm font-bold text-on-surface truncate">{animal.name}</p>
									<p class="text-xs text-red-600 font-bold">Sisa: {animal.stock} ekor</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Recent Orders Table -->
	<div class="clay-card bg-white rounded-2xl p-6">
		<div class="flex items-center justify-between mb-6">
			<h2 class="font-headline font-black text-lg text-on-surface">Pesanan Terbaru</h2>
			{#if $isAdmin}
				<a href="/dashboard/pesanan" class="text-sm font-bold text-primary hover:underline flex items-center gap-1">
					Lihat Semua <span class="material-symbols-outlined text-base">arrow_forward</span>
				</a>
			{/if}
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="text-left">
						<th class="pb-3 pr-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">ID Pesanan</th>
						<th class="pb-3 pr-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Pemesan</th>
						<th class="pb-3 pr-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden md:table-cell">Total</th>
						<th class="pb-3 pr-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
						<th class="pb-3 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-container">
					{#each recentOrders as order}
						<tr class="hover:bg-surface-container-lowest transition-colors">
							<td class="py-3 pr-4">
								<a href="/dashboard/pesanan" class="font-mono text-xs text-primary font-bold hover:underline">
									{order.id.slice(-8)}
								</a>
							</td>
							<td class="py-3 pr-4 font-medium text-on-surface">{order.customerName}</td>
							<td class="py-3 pr-4 font-bold text-on-surface hidden md:table-cell">{fmt(order.total)}</td>
							<td class="py-3 pr-4">
								<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold {statusLabel[order.status]?.cls}">
									{statusLabel[order.status]?.label}
								</span>
							</td>
							<td class="py-3 text-on-surface-variant hidden lg:table-cell">{fmtDate(order.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
