import { writable, derived } from 'svelte/store';

export interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
	image: string;
	weight: string;
}

function createCart() {
	const { subscribe, set, update } = writable<CartItem[]>([]);

	return {
		subscribe,
		addItem: (item: Omit<CartItem, 'quantity'>) =>
			update((items) => {
				const existingItem = items.find((i) => i.id === item.id);
				if (existingItem) {
					return items.map((i) =>
						i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
					);
				}
				return [...items, { ...item, quantity: 1 }];
			}),
		removeItem: (id: number) =>
			update((items) => items.filter((i) => i.id !== id)),
		removeItems: (ids: number[]) =>
			update((items) => {
				const idSet = new Set(ids);
				return items.filter((i) => !idSet.has(i.id));
			}),
		updateQuantity: (id: number, quantity: number) =>
			update((items) =>
				items.map((i) => (i.id === id ? { ...i, quantity } : i)).filter((i) => i.quantity > 0)
			),
		increment: (id: number) =>
			update((items) =>
				items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
			),
		decrement: (id: number) =>
			update((items) =>
				items
					.map((i) =>
						i.id === id ? { ...i, quantity: i.quantity - 1 } : i
					)
					.filter((i) => i.quantity > 0)
			),
		clear: () => set([])
	};
}

export const cart = createCart();

export const cartTotal = derived(cart, ($cart) =>
	$cart.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const cartItemCount = derived(cart, ($cart) =>
	$cart.reduce((count, item) => count + item.quantity, 0)
);
