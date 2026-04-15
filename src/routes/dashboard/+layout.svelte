<script lang="ts">
	import { auth, isAdmin } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { isEditMode } from '$lib/stores/content';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let isSidebarOpen = $state(false);
	let currentUser = $state<{ name: string; email: string; role: string; avatar: string } | null>(null);

	onMount(() => {
		const unsub = auth.subscribe((user) => {
			if (!user) {
				goto('/login');
			} else {
				currentUser = user;
			}
		});
		return unsub;
	});

	const navItems = [
		{ href: '/dashboard', label: 'Ringkasan', icon: 'dashboard', adminOnly: false },
		{ href: '/dashboard/hewan', label: 'Manajemen Hewan', icon: 'pets', adminOnly: true },
		{ href: '/dashboard/pesanan', label: 'Pesanan', icon: 'shopping_bag', adminOnly: true },
		{ href: '/dashboard/pelanggan', label: 'Pelanggan', icon: 'group', adminOnly: true },
		{ href: '/dashboard/keuangan', label: 'Keuangan', icon: 'account_balance_wallet', adminOnly: true },
		{ href: '/dashboard/pengaturan', label: 'Pengaturan', icon: 'settings', adminOnly: true }
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return $page.url.pathname === '/dashboard';
		}
		return $page.url.pathname.startsWith(href);
	}

	function handleLogout() {
		isEditMode.set(false);
		auth.logout();
		goto('/');
	}

	function goToEditMode() {
		isEditMode.set(true);
		goto('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
	/>
</svelte:head>

<div class="min-h-screen bg-[#f5f7f6] font-body flex">
	<!-- Sidebar Overlay (mobile) -->
	{#if isSidebarOpen}
		<div
			class="fixed inset-0 z-30 bg-black/40 lg:hidden"
			onclick={() => (isSidebarOpen = false)}
		></div>
	{/if}

	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-40 w-72 bg-emerald-950 flex flex-col transition-transform duration-300 lg:translate-x-0 {isSidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<!-- Logo -->
		<div class="flex items-center gap-3 px-6 py-6 border-b border-emerald-800/50">
			<img src="/BQ_Logo_Mono_4.png" alt="Logo" class="w-9 h-9" />
			<div>
				<p class="text-lg font-black text-white font-headline tracking-tighter">Best-Qurban</p>
				<p class="text-xs text-emerald-400/70 font-medium">Dashboard</p>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
			{#each navItems as item}
				{#if !item.adminOnly || $isAdmin}
					<a
						href={item.href}
						onclick={() => (isSidebarOpen = false)}
						class="flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm transition-all {isActive(item.href)
							? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
							: 'text-emerald-300/70 hover:bg-emerald-800/50 hover:text-white'}"
					>
						<span class="material-symbols-outlined text-xl">{item.icon}</span>
						{item.label}
					</a>
				{/if}
			{/each}

			<!-- Admin: Edit Landing Page -->
			{#if $isAdmin}
				<div class="pt-4 mt-4 border-t border-emerald-800/50">
					<button
						onclick={goToEditMode}
						class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm text-secondary-container hover:bg-emerald-800/50 transition-all"
					>
						<span class="material-symbols-outlined text-xl">edit</span>
						Edit Landing Page
					</button>
					<a
						href="/"
						target="_blank"
						class="flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm text-emerald-300/70 hover:bg-emerald-800/50 hover:text-white transition-all"
					>
						<span class="material-symbols-outlined text-xl">open_in_new</span>
						Lihat Website
					</a>
				</div>
			{/if}
		</nav>

		<!-- User Info + Logout -->
		<div class="border-t border-emerald-800/50 px-4 py-5">
			{#if currentUser}
				<div class="flex items-center gap-3 mb-4">
					<img
						src={currentUser.avatar}
						alt={currentUser.name}
						class="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600"
					/>
					<div class="min-w-0">
						<p class="text-sm font-bold text-white truncate">{currentUser.name}</p>
						<p class="text-xs text-emerald-400/70 truncate">{currentUser.email}</p>
					</div>
					{#if currentUser.role === 'admin'}
						<span class="ml-auto shrink-0 text-xs font-black bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">Admin</span>
					{/if}
				</div>
			{/if}
			<button
				onclick={handleLogout}
				class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold text-sm"
			>
				<span class="material-symbols-outlined text-xl">logout</span>
				Keluar
			</button>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 lg:ml-72 min-h-screen flex flex-col">
		<!-- Top Bar -->
		<header class="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-surface-container-high px-4 md:px-8 h-16 flex items-center gap-4">
			<button
				onclick={() => (isSidebarOpen = true)}
				class="lg:hidden p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface"
			>
				<span class="material-symbols-outlined">menu</span>
			</button>

			<!-- Breadcrumb -->
			<div class="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
				<span class="text-primary font-bold">Dashboard</span>
				{#if $page.url.pathname !== '/dashboard'}
					<span class="material-symbols-outlined text-sm">chevron_right</span>
					<span class="text-on-surface font-bold capitalize">
						{$page.url.pathname.split('/').pop()?.replace('-', ' ')}
					</span>
				{/if}
			</div>

			<div class="ml-auto flex items-center gap-3">
				{#if currentUser}
					<span class="hidden sm:block text-sm font-medium text-on-surface-variant">
						Halo, <span class="font-bold text-on-surface">{currentUser.name.split(' ')[0]}</span>
					</span>
					<img
						src={currentUser.avatar}
						alt={currentUser.name}
						class="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30"
					/>
				{/if}
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 p-4 md:p-8">
			{@render children()}
		</main>
	</div>
</div>
