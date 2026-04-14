export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
}

export interface CartItem extends Product {
	quantity: number;
}

export interface OrderDetails {
	orderId: string;
	items: CartItem[];
	total: number;
	customerInfo: CustomerInfo;
}

export interface CustomerInfo {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
}

export const products: Product[] = [
	{
		id: 'PROD-001',
		name: 'Wireless Headphones',
		description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
		price: 1500000,
		image: '🎧',
		category: 'Electronics'
	},
	{
		id: 'PROD-002',
		name: 'Smart Watch',
		description: 'Feature-rich smartwatch with fitness tracking and notifications.',
		price: 2500000,
		image: '⌚',
		category: 'Electronics'
	},
	{
		id: 'PROD-003',
		name: 'Running Shoes',
		description: 'Comfortable running shoes with excellent cushioning and support.',
		price: 1200000,
		image: '👟',
		category: 'Fashion'
	},
	{
		id: 'PROD-004',
		name: 'Backpack',
		description: 'Durable backpack with multiple compartments and laptop sleeve.',
		price: 750000,
		image: '🎒',
		category: 'Fashion'
	},
	{
		id: 'PROD-005',
		name: 'Coffee Maker',
		description: 'Automatic coffee maker with programmable settings and timer.',
		price: 1800000,
		image: '☕',
		category: 'Home'
	},
	{
		id: 'PROD-006',
		name: 'Desk Lamp',
		description: 'LED desk lamp with adjustable brightness and color temperature.',
		price: 450000,
		image: '💡',
		category: 'Home'
	}
];
