import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function DebugMenu() {
  console.log("Component: DebugMenu");
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");

        // Test products
        const productsRes = await fetch("/api/products");
        console.log("Products response status:", productsRes.status);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          console.log("Products data:", productsData);
          setProducts(productsData);
        } else {
          console.error("Products fetch failed:", productsRes.status);
        }

        // Test recipes
        const recipesRes = await fetch("/api/recipes");
        console.log("Recipes response status:", recipesRes.status);

        if (recipesRes.ok) {
          const recipesData = await recipesRes.json();
          console.log("Recipes data:", recipesData);
          setRecipes(recipesData);
        } else {
          console.error("Recipes fetch failed:", recipesRes.status);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography>Loading debug info...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Menu Debug Page
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Products ({products.length})
        </Typography>
        {products.length > 0 ? (
          <Box>
            {products.map((product, index) => (
              <Box
                key={index}
                sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Typography variant="h6">{product.name}</Typography>
                <Typography>Category: {product.category}</Typography>
                <Typography>Recipes: {product.recipes?.length || 0}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No products found</Typography>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recipes ({recipes.length})
        </Typography>
        {recipes.length > 0 ? (
          <Box>
            {recipes.map((recipe, index) => (
              <Box
                key={index}
                sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Typography variant="h6">
                  {recipe.product?.name} - {recipe.variant}
                </Typography>
                <Typography>
                  Ingredients: {recipe.ingredients?.length || 0}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No recipes found</Typography>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Coffee Drinks Filter Test
        </Typography>
        <Typography>
          Coffee drinks:{" "}
          {
            products.filter((p) => ["Espresso", "Coffee"].includes(p.category))
              .length
          }
        </Typography>
        <Typography>
          Other products (filtered out):{" "}
          {
            products.filter((p) => !["Espresso", "Coffee"].includes(p.category))
              .length
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Note: Only coffee drinks are shown on the menu. Bakery section is a
          placeholder for future items.
        </Typography>
      </Box>
    </Container>
  );
}

// Disable static generation for this page to avoid SSR issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
