import InventoryManagement from "../../components/InventoryManagement";
import ClientProtectedRoute from "../../components/ClientProtectedRoute";

export default function InventoryPage() {
  console.log("Component: InventoryPage");
  return (
    <ClientProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
      <InventoryManagement />
    </ClientProtectedRoute>
  );
}

// Disable static generation for this page to avoid router SSR issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
