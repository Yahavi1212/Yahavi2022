# WordPress CORS Configuration Guide

## Problem
WPGraphQL requests blocked by browser CORS policy

## Solution - 3 Methods

### Method 1: WPGraphQL CORS Plugin (Easiest)

1. WordPress Admin → Plugins → Add New
2. Search: "WPGraphQL CORS"
3. Install and Activate
4. Go to Settings → WPGraphQL CORS
5. Add your GCE domain:
   ```
   http://34.44.252.70
   https://hackknow.com
   https://www.hackknow.com
   ```
6. Save settings

---

### Method 2: Functions.php Code

Add to your WordPress theme `functions.php`:

```php
// Allow CORS for WPGraphQL
add_action('graphql_response_headers', function($headers) {
    $headers['Access-Control-Allow-Origin'] = '*';
    $headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS';
    $headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    $headers['Access-Control-Allow-Credentials'] = 'true';
    return $headers;
});

// Handle preflight OPTIONS requests
add_action('init', function() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
        exit(0);
    }
});
```

---

### Method 3: .htaccess Rules

Add to WordPress root `.htaccess`:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "POST, GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

---

## Test CORS

Open browser console on your GCE site and run:

```javascript
fetch('https://your-wordpress-site.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `{ products { nodes { id name } } }`
  })
})
.then(r => r.json())
.then(data => console.log(data))
.catch(e => console.error(e));
```

If no CORS error → Success!

---

## Required WordPress Plugins

1. **WPGraphQL** - Core GraphQL API
2. **WooCommerce** - E-commerce
3. **WPGraphQL for WooCommerce** - Connect WooCommerce to GraphQL
4. **WPGraphQL CORS** - CORS handling (optional if using Method 2/3)

---

## Product Setup in WordPress

### Add a Product:
1. WordPress Admin → Products → Add New
2. Product Name: "Your Product Name"
3. Product Type: Simple Product
4. Price: Set regular and sale price
5. Category: Select/create category
6. Featured Image: Upload product image
7. Publish

### WPGraphQL will automatically expose:
- Product name
- Price
- Description
- Image URL
- Categories
- Stock status

---

## Test GraphQL Endpoint

Visit: `https://your-wordpress-site.com/graphql`

Run query:
```graphql
query GetProducts {
  products(first: 10) {
    nodes {
      id
      name
      slug
      price
      regularPrice
      image {
        sourceUrl
      }
    }
  }
}
```

---

## Troubleshooting

### "Access-Control-Allow-Origin" error:
→ CORS not configured properly. Try Method 1 (Plugin)

### "No products found" in React:
→ Check WPGraphQL plugin is active
→ Check WooCommerce products exist
→ Check browser console for errors

### Images not loading:
→ WordPress media library permissions
→ Hotlink protection blocking images

---

## Quick Checklist

- [ ] WPGraphQL plugin installed
- [ ] WooCommerce active
- [ ] At least 1 product added
- [ ] CORS configured
- [ ] GraphQL endpoint responding
- [ ] Products showing on frontend
