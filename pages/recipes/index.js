import RecipeManagement from "../../components/RecipeManagement";
import ClientProtectedRoute from "../../components/ClientProtectedRoute";

export default function RecipesPage() {
  return (
    <ClientProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
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
