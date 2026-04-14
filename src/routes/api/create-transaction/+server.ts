import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// Dummy endpoint since Midtrans is removed
	return new Response(
		JSON.stringify({
			message: "Simulated Backend Endpoint"
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};

export const GET: RequestHandler = async ({ url }) => {
	// Dummy endpoint since Midtrans is removed
	return new Response(
		JSON.stringify({
			message: "Simulated Backend Endpoint"
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};
