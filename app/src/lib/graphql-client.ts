import { getAuthToken } from "@/lib/auth-token";

// Default to relative path so reverse-proxy hides shop.hackknow.com.
// Override via VITE_WORDPRESS_URL only in local dev.
const GRAPHQL_ENDPOINT =
  (import.meta.env.VITE_WORDPRESS_URL as string | undefined) ?? "/graphql";

if (GRAPHQL_ENDPOINT.includes("your-wordpress-site.com")) {
  console.error("VITE_WORDPRESS_URL is using a placeholder value. Update app/.env.");
}

export async function fetchGraphQL(query: string, variables: Record<string, unknown> = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "Failed to fetch API");
  }
  return json.data;
}

export const GET_PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 50) {
      nodes {
        id
        databaseId
        name
        slug
        description
        shortDescription
        status
        ... on SimpleProduct {
          price
          regularPrice
        }
        productCategories {
          nodes {
            id
            databaseId
            name
            slug
          }
        }
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;
