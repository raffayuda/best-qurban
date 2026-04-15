<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { cartItemCount } from '$lib/stores/cart';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	let { children } = $props();
	let scrollProgress = $state(0);
	let isMobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Beranda' },
		{ href: '/tentang', label: 'Tentang' },
		{ href: '/hewan', label: 'Hewan' },
		{ href: '/kontak', label: 'Kontak' },
		{ href: '/cek-pesanan', label: 'Cek Pesanan' }
	];

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', () => {
				const scrollTop = window.scrollY;
				const docHeight = document.documentElement.scrollHeight - window.innerHeight;
				scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
</svelte:head>

<div class="bg-background font-body text-on-surface antialiased">
	<!-- Global Scroll Progress Indicator -->
	<div class="fixed top-0 left-0 z-[60] h-1 w-full pointer-events-none">
		<div class="h-full bg-gradient-to-r from-primary via-secondary-container to-primary" style="width: {scrollProgress * 100}%; transition: width 0.1s ease-out;"></div>
	</div>

	<!-- Top Navigation Bar — hidden on /dashboard/* and /login -->
	{#if !$page.url.pathname.startsWith('/dashboard') && $page.url.pathname !== '/login'}
		<header class="fixed top-0 w-full z-50 rounded-b-2xl bg-emerald-50/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 max-w-full shadow-[0_20px_40px_rgba(0,104,83,0.05)]">
			<div class="flex items-center gap-2">
				<img src=/BQ_Logo_Mono_4.png alt="Logo" class="w-8 h-8 md:w-10 md:h-10" />
				<a href="/" class="text-xl md:text-2xl font-black tracking-tighter text-emerald-900 font-headline -ml-2">Best-Qurban</a>
			</div>
			
			<nav class="hidden lg:flex gap-1 xl:gap-2">
				{#each navLinks as link}
					<a 
						href={link.href}
						class="px-4 xl:px-6 py-2.5 rounded-full font-headline font-bold transition-all duration-300 text-sm xl:text-base {
							$page.url.pathname === link.href 
								? 'bg-primary text-on-primary clay-button-primary' 
								: 'text-emerald-700/70 hover:bg-emerald-100/50 hover:text-emerald-900'
						}"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<div class="flex items-center gap-2 md:gap-4 lg:gap-6">
				<a href="/keranjang" data-cart-button class="relative p-2 hover:bg-emerald-100/50 rounded-full transition-colors flex-shrink-0">
					<span class="material-symbols-outlined text-2xl text-emerald-900">shopping_cart</span>
					{#if $cartItemCount > 0}
						<span class="absolute -top-1 -right-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center clay-button-secondary">
							{$cartItemCount}
						</span>
					{/if}
				</a>
				<button class="hidden sm:block bg-primary text-on-primary px-6 py-2.5 xl:px-8 xl:py-3 rounded-full font-headline font-bold clay-button-primary active:scale-95 transition-all text-sm xl:text-base whitespace-nowrap">Donasi</button>

				<!-- Profile / Dashboard Link -->
				<a
					href="/dashboard"
					class="hidden sm:flex w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-surface-container-high overflow-hidden clay-card flex-shrink-0 hover:ring-2 hover:ring-primary/40 transition-all"
					title="Dashboard"
				>
					<img alt="User profile" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" />
				</a>

				<!-- Mobile Menu Button -->
				<button class="lg:hidden p-2 text-emerald-900 hover:bg-emerald-100/50 rounded-full transition-colors" onclick={() => isMobileMenuOpen = !isMobileMenuOpen}>
					<span class="material-symbols-outlined text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
				</button>
			</div>
		</header>

		<!-- Mobile Navigation Overlay -->
		{#if isMobileMenuOpen}
			<div transition:fade={{ duration: 200 }} class="fixed inset-0 z-40 bg-emerald-950/20 backdrop-blur-[2px] lg:hidden" onclick={() => isMobileMenuOpen = false}></div>
			<nav transition:slide={{ duration: 300, axis: 'y' }} class="fixed top-20 left-0 w-full z-40 bg-emerald-50 rounded-b-3xl shadow-xl flex flex-col p-6 gap-2 border-t border-emerald-100 lg:hidden">
				{#each navLinks as link}
					<a 
						href={link.href}
						onclick={() => isMobileMenuOpen = false}
						class="px-6 py-4 rounded-xl font-headline font-bold transition-all text-lg {
							$page.url.pathname === link.href 
								? 'bg-primary text-on-primary clay-button-primary' 
								: 'text-emerald-800 hover:bg-emerald-100/50'
						}"
					>
						{link.label}
					</a>
				{/each}
				<div class="w-full h-px bg-emerald-200 my-4"></div>
				<a href="/dashboard" onclick={() => isMobileMenuOpen = false} class="flex items-center gap-2 px-6 py-4 rounded-xl font-headline font-bold text-lg text-emerald-800 hover:bg-emerald-100/50 transition-all">
					<span class="material-symbols-outlined">dashboard</span>
					Dashboard
				</a>
				<button class="w-full bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold text-lg clay-button-primary active:scale-95 transition-all">Donasi Sekarang</button>
			</nav>
		{/if}
	{/if}

	<main class="{!$page.url.pathname.startsWith('/dashboard') && $page.url.pathname !== '/login' ? 'pt-28' : ''}">
		{@render children()}
	</main>

	<!-- Footer — hidden on /dashboard/* and /login -->
	{#if !$page.url.pathname.startsWith('/dashboard') && $page.url.pathname !== '/login'}
		<footer class="bg-emerald-900 rounded-t-[4rem] mt-20 flex flex-col items-center py-16 px-4 gap-8 shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
			<div class="text-4xl font-black text-amber-400 font-headline tracking-tighter">Best-Qurban</div>
			<nav class="flex flex-wrap justify-center gap-10">
				<a href="/" class="text-emerald-200/60 font-headline uppercase tracking-widest text-xs font-bold hover:text-amber-200 transition-colors">Beranda</a>
				<a href="/tentang" class="text-emerald-200/60 font-headline uppercase tracking-widest text-xs font-bold hover:text-amber-200 transition-colors">Tentang</a>
				<a href="/hewan" class="text-emerald-200/60 font-headline uppercase tracking-widest text-xs font-bold hover:text-amber-200 transition-colors">Hewan</a>
				<a href="/kontak" class="text-emerald-200/60 font-headline uppercase tracking-widest text-xs font-bold hover:text-amber-200 transition-colors">Kontak</a>
				<a href="/cek-pesanan" class="text-emerald-200/60 font-headline uppercase tracking-widest text-xs font-bold hover:text-amber-200 transition-colors">Cek Pesanan</a>
				<a href="/keranjang" class="text-emerald-200/60 font-headline uppercase tracking-widest text-xs font-bold hover:text-amber-200 transition-colors">Keranjang</a>
			</nav>
			<div class="w-full max-w-4xl h-px bg-white/10 my-4"></div>
			<p class="text-amber-400 font-headline uppercase tracking-widest text-xs opacity-60">
				© 2025 Best-Qurban. The Tactile Sanctuary of Giving.
			</p>
		</footer>
	{/if}
</div>
