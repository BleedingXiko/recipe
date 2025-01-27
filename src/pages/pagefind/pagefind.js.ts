import type { APIContext } from "astro";

export async function GET({}: APIContext) {
  const data = 'export const search = () => {return {results: []}}';

  // Return a Response with the correct content and status
  return new Response(data, {
    status: 200, // Optional, default is 200
    headers: {
      "Content-Type": "application/javascript", // You might want to set the appropriate content type
    },
  });
}
