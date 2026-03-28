import { AdminContentLoader } from "@/components/admin/AdminContentLoader";

export default function AdminLoading() {
  return (
    <AdminContentLoader
      title="Loading section"
      description="The sidebar and header stay in place while the next admin page is prepared."
    />
  );
}
