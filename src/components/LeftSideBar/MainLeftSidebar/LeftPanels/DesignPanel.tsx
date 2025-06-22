import { useGetTemplatesQuery } from "@/services/templateApi";

export default function DesignPanel() {
  const { data: Templates, isLoading } = useGetTemplatesQuery();
  console.log(Templates);
  if (isLoading) return <span>Loading...</span>;
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Templates</h2>
      {/* <ul className="space-y-2">
        {Templates?.results.map((template) => (
          <li key={template.id} className="border p-2">
            {template.name}
          </li>
        ))}
      </ul> */}
    </div>
  );
}
