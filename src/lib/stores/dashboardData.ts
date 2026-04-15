import { writable } from 'svelte/store';

export type AnimalStatus = 'tersedia' | 'dicadangkan' | 'terjual';
export type AnimalType = 'sapi' | 'kambing' | 'domba';
export type OrderStatus =
	| 'menunggu_pembayaran'
	| 'dibayar'
	| 'perawatan'
	| 'penyembelihan'
	| 'dokumentasi'
	| 'selesai'
	| 'gagal';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Animal {
	id: number;
	name: string;
	type: AnimalType;
	weight: number;
	price: number;
	description: string;
	image: string;
	status: AnimalStatus;
	stock: number;
}

export interface OrderItem {
	animalId: number;
	animalName: string;
	price: number;
	quantity: number;
}

export interface Order {
	id: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	customerAddress: string;
	items: OrderItem[];
	total: number;
	adminFee: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	paymentMethod: string;
	paymentChannel: string;
	createdAt: string;
	notes: string;
}

export interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	orderIds: string[];
	notes: string;
	createdAt: string;
}

export interface AppSettings {
	adminFeePercent: number;
	freeShipping: boolean;
	discountActive: boolean;
	discountPercent: number;
	discountCode: string;
}

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const DUMMY_ANIMALS: Animal[] = [
	{
		id: 1,
		name: 'Sapi Limousin Premium',
		type: 'sapi',
		weight: 650,
		price: 45500000,
		description:
			'Genetik unggul dengan tekstur daging premium. Dipelihara dengan pakan organik di Sanctuary Best-Qurban.',
		image:
			'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
		status: 'tersedia',
		stock: 5
	},
	{
		id: 2,
		name: 'Domba Merino Ekspor',
		type: 'domba',
		weight: 45,
		price: 4250000,
		description: 'Domba berkualitas ekspor dengan tingkat lemak rendah dan karkas yang melimpah.',
		image:
			'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
		status: 'tersedia',
		stock: 12
	},
	{
		id: 3,
		name: 'Kambing Boer Jantan',
		type: 'kambing',
		weight: 55,
		price: 5750000,
		description:
			'Postur gagah dengan pertumbuhan daging yang sangat baik. Pilihan tepat untuk kurban personal.',
		image:
			'https://images.unsplash.com/photo-1524024272821-2974ef4e86d6?auto=format&fit=crop&q=80&w=800',
		status: 'tersedia',
		stock: 8
	},
	{
		id: 4,
		name: 'Sapi Simental Grade A',
		type: 'sapi',
		weight: 580,
		price: 38000000,
		description:
			'Sapi simental dengan badan besar dan daging berlimpah, cocok untuk kurban bersama 7 orang.',
		image:
			'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800',
		status: 'dicadangkan',
		stock: 3
	},
	{
		id: 5,
		name: 'Kambing Etawa',
		type: 'kambing',
		weight: 40,
		price: 3800000,
		description: 'Kambing Etawa dengan bobot ideal untuk kurban individu. Sehat dan telah divaksinasi.',
		image:
			'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800',
		status: 'tersedia',
		stock: 15
	},
	{
		id: 6,
		name: 'Domba Garut Pilihan',
		type: 'domba',
		weight: 38,
		price: 3500000,
		description:
			'Domba Garut lokal pilihan dengan kualitas premium. Sudah lolos pemeriksaan dokter hewan.',
		image:
			'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&q=80&w=800',
		status: 'terjual',
		stock: 0
	},
	{
		id: 7,
		name: 'Sapi Brahman Lokal',
		type: 'sapi',
		weight: 500,
		price: 32500000,
		description:
			'Sapi Brahman lokal yang terkenal tahan panas dan memiliki daging berkualitas tinggi.',
		image:
			'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=800',
		status: 'tersedia',
		stock: 2
	}
];

const DUMMY_ORDERS: Order[] = [
	{
		id: 'ORDER-1776143000-0001',
		customerName: 'Budi Santoso',
		customerEmail: 'budi@email.com',
		customerPhone: '08123456789',
		customerAddress: 'Jl. Merdeka No. 10, Jakarta Selatan',
		items: [{ animalId: 2, animalName: 'Domba Merino Ekspor', price: 4250000, quantity: 1 }],
		total: 4250000,
		adminFee: 42500,
		status: 'perawatan',
		paymentStatus: 'success',
		paymentMethod: 'QRIS',
		paymentChannel: 'GoPay',
		createdAt: '2026-04-10T08:00:00Z',
		notes: 'Distribusi ke Panti Asuhan Al-Amin'
	},
	{
		id: 'ORDER-1776143000-0002',
		customerName: 'Siti Rahma',
		customerEmail: 'siti@email.com',
		customerPhone: '08987654321',
		customerAddress: 'Jl. Sudirman No. 5, Bandung',
		items: [{ animalId: 3, animalName: 'Kambing Boer Jantan', price: 5750000, quantity: 1 }],
		total: 5750000,
		adminFee: 57500,
		status: 'dibayar',
		paymentStatus: 'success',
		paymentMethod: 'QRIS',
		paymentChannel: 'OVO',
		createdAt: '2026-04-11T10:30:00Z',
		notes: ''
	},
	{
		id: 'ORDER-1776143000-0003',
		customerName: 'Ahmad Fauzi',
		customerEmail: 'ahmad@email.com',
		customerPhone: '08567891234',
		customerAddress: 'Jl. Gatot Subroto No. 20, Surabaya',
		items: [{ animalId: 1, animalName: 'Sapi Limousin Premium', price: 45500000, quantity: 1 }],
		total: 45500000,
		adminFee: 455000,
		status: 'menunggu_pembayaran',
		paymentStatus: 'pending',
		paymentMethod: 'QRIS',
		paymentChannel: '-',
		createdAt: '2026-04-12T14:00:00Z',
		notes: 'Konfirmasi via WhatsApp'
	},
	{
		id: 'ORDER-1776143000-0004',
		customerName: 'Dewi Kurniawati',
		customerEmail: 'dewi@email.com',
		customerPhone: '08765432190',
		customerAddress: 'Jl. Pemuda No. 8, Semarang',
		items: [
			{ animalId: 5, animalName: 'Kambing Etawa', price: 3800000, quantity: 2 }
		],
		total: 7600000,
		adminFee: 76000,
		status: 'selesai',
		paymentStatus: 'success',
		paymentMethod: 'QRIS',
		paymentChannel: 'Dana',
		createdAt: '2026-04-08T09:00:00Z',
		notes: 'Pesanan sudah selesai & didistribusikan'
	},
	{
		id: 'ORDER-1776143000-0005',
		customerName: 'Rudi Hermawan',
		customerEmail: 'rudi@email.com',
		customerPhone: '08234567891',
		customerAddress: 'Jl. Diponegoro No. 15, Yogyakarta',
		items: [{ animalId: 4, animalName: 'Sapi Simental Grade A', price: 38000000, quantity: 1 }],
		total: 38000000,
		adminFee: 380000,
		status: 'gagal',
		paymentStatus: 'failed',
		paymentMethod: 'QRIS',
		paymentChannel: '-',
		createdAt: '2026-04-09T11:00:00Z',
		notes: 'Pembayaran expired, belum ada follow up'
	},
	{
		id: 'ORDER-1776143000-0006',
		customerName: 'Fatimah Zahra',
		customerEmail: 'fatimah@email.com',
		customerPhone: '08345678902',
		customerAddress: 'Jl. Ahmad Yani No. 3, Medan',
		items: [{ animalId: 2, animalName: 'Domba Merino Ekspor', price: 4250000, quantity: 1 }],
		total: 4250000,
		adminFee: 42500,
		status: 'penyembelihan',
		paymentStatus: 'success',
		paymentMethod: 'QRIS',
		paymentChannel: 'LinkAja',
		createdAt: '2026-04-07T07:00:00Z',
		notes: ''
	},
	{
		id: 'ORDER-1776143000-0007',
		customerName: 'Hendra Wijaya',
		customerEmail: 'hendra@email.com',
		customerPhone: '08456789013',
		customerAddress: 'Jl. Imam Bonjol No. 25, Makassar',
		items: [
			{ animalId: 3, animalName: 'Kambing Boer Jantan', price: 5750000, quantity: 1 },
			{ animalId: 5, animalName: 'Kambing Etawa', price: 3800000, quantity: 1 }
		],
		total: 9550000,
		adminFee: 95500,
		status: 'dokumentasi',
		paymentStatus: 'success',
		paymentMethod: 'QRIS',
		paymentChannel: 'GoPay',
		createdAt: '2026-04-06T15:00:00Z',
		notes: 'Video dokumentasi sudah dikirim via WA'
	},
	{
		id: 'ORDER-1776143000-0008',
		customerName: 'Nur Hidayah',
		customerEmail: 'nurhidayah@email.com',
		customerPhone: '08567890124',
		customerAddress: 'Jl. Raya Bogor No. 50, Depok',
		items: [{ animalId: 7, animalName: 'Sapi Brahman Lokal', price: 32500000, quantity: 1 }],
		total: 32500000,
		adminFee: 325000,
		status: 'dibayar',
		paymentStatus: 'success',
		paymentMethod: 'QRIS',
		paymentChannel: 'BCA Mobile',
		createdAt: '2026-04-13T09:00:00Z',
		notes: ''
	}
];

const DUMMY_CUSTOMERS: Customer[] = [
	{
		id: 'cust-1',
		name: 'Budi Santoso',
		email: 'budi@email.com',
		phone: '08123456789',
		address: 'Jl. Merdeka No. 10, Jakarta Selatan',
		orderIds: ['ORDER-1776143000-0001'],
		notes: 'Pelanggan setia sejak 2024',
		createdAt: '2024-05-10'
	},
	{
		id: 'cust-2',
		name: 'Siti Rahma',
		email: 'siti@email.com',
		phone: '08987654321',
		address: 'Jl. Sudirman No. 5, Bandung',
		orderIds: ['ORDER-1776143000-0002'],
		notes: '',
		createdAt: '2026-04-11'
	},
	{
		id: 'cust-3',
		name: 'Ahmad Fauzi',
		email: 'ahmad@email.com',
		phone: '08567891234',
		address: 'Jl. Gatot Subroto No. 20, Surabaya',
		orderIds: ['ORDER-1776143000-0003'],
		notes: 'Hubungi via WA untuk konfirmasi pembayaran',
		createdAt: '2026-04-12'
	},
	{
		id: 'cust-4',
		name: 'Dewi Kurniawati',
		email: 'dewi@email.com',
		phone: '08765432190',
		address: 'Jl. Pemuda No. 8, Semarang',
		orderIds: ['ORDER-1776143000-0004'],
		notes: 'Distribusi ke yayasan lokal',
		createdAt: '2026-04-08'
	},
	{
		id: 'cust-5',
		name: 'Rudi Hermawan',
		email: 'rudi@email.com',
		phone: '08234567891',
		address: 'Jl. Diponegoro No. 15, Yogyakarta',
		orderIds: ['ORDER-1776143000-0005'],
		notes: 'Pembayaran gagal, perlu follow up segera',
		createdAt: '2026-04-09'
	},
	{
		id: 'cust-6',
		name: 'Fatimah Zahra',
		email: 'fatimah@email.com',
		phone: '08345678902',
		address: 'Jl. Ahmad Yani No. 3, Medan',
		orderIds: ['ORDER-1776143000-0006'],
		notes: '',
		createdAt: '2026-04-07'
	},
	{
		id: 'cust-7',
		name: 'Hendra Wijaya',
		email: 'hendra@email.com',
		phone: '08456789013',
		address: 'Jl. Imam Bonjol No. 25, Makassar',
		orderIds: ['ORDER-1776143000-0007'],
		notes: 'Pesan lebih dari 1 hewan, preferensi distribusi ke mesjid setempat',
		createdAt: '2026-04-06'
	},
	{
		id: 'cust-8',
		name: 'Nur Hidayah',
		email: 'nurhidayah@email.com',
		phone: '08567890124',
		address: 'Jl. Raya Bogor No. 50, Depok',
		orderIds: ['ORDER-1776143000-0008'],
		notes: '',
		createdAt: '2026-04-13'
	}
];

const DEFAULT_SETTINGS: AppSettings = {
	adminFeePercent: 1,
	freeShipping: true,
	discountActive: false,
	discountPercent: 0,
	discountCode: ''
};

// ─── Stores ────────────────────────────────────────────────────────────────────

const _animals = writable<Animal[]>(JSON.parse(JSON.stringify(DUMMY_ANIMALS)));
const _orders = writable<Order[]>(JSON.parse(JSON.stringify(DUMMY_ORDERS)));
const _customers = writable<Customer[]>(JSON.parse(JSON.stringify(DUMMY_CUSTOMERS)));
const _settings = writable<AppSettings>({ ...DEFAULT_SETTINGS });

export const dashboardAnimals = {
	subscribe: _animals.subscribe,
	add: (animal: Omit<Animal, 'id'>) =>
		_animals.update((list) => [...list, { ...animal, id: Date.now() }]),
	update: (id: number, data: Partial<Animal>) =>
		_animals.update((list) => list.map((a) => (a.id === id ? { ...a, ...data } : a))),
	remove: (id: number) => _animals.update((list) => list.filter((a) => a.id !== id))
};

export const dashboardOrders = {
	subscribe: _orders.subscribe,
	updateStatus: (id: string, status: OrderStatus) =>
		_orders.update((list) => list.map((o) => (o.id === id ? { ...o, status } : o))),
	updateNotes: (id: string, notes: string) =>
		_orders.update((list) => list.map((o) => (o.id === id ? { ...o, notes } : o)))
};

export const dashboardCustomers = {
	subscribe: _customers.subscribe,
	updateNotes: (id: string, notes: string) =>
		_customers.update((list) => list.map((c) => (c.id === id ? { ...c, notes } : c)))
};

export const dashboardSettings = {
	subscribe: _settings.subscribe,
	update: (data: Partial<AppSettings>) => _settings.update((s) => ({ ...s, ...data }))
};
