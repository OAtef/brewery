import RecipeManagement from "../../components/recipes/RecipeManagement";
import ClientProtectedRoute from "../../components/auth/ClientProtectedRoute";

export default function RecipesPage() {
  console.log("Component: RecipesPage");
  return (
    <ClientProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
      <RecipeManagement />
    </ClientProtectedRoute>
  );
}

// Disable static generation for this page to avoid SSR issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
