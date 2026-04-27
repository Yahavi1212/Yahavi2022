
const GRAPHQL_ENDPOINT = import.meta.env.VITE_WORDPRESS_URL;

// Validate endpoint configuration
if (!GRAPHQL_ENDPOINT) {
  console.error('❌ VITE_WORDPRESS_URL not set. Please create app/.env with:');
  console.error('VITE_WORDPRESS_URL=https://shop.hackknow.com/graphql');
}

if (GRAPHQL_ENDPOINT?.includes('your-wordpress-site.com')) {
  console.error('❌ VITE_WORDPRESS_URL is using placeholder value. Please update app/.env');
}

export async function fetchGraphQL(query: string, variables = {}) {
  if (!GRAPHQL_ENDPOINT) {
    throw new Error(
      'VITE_WORDPRESS_URL not configured. Please check app/.env file and restart dev server.'
    );
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'Failed to fetch API');
    }
    return json.data;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
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
