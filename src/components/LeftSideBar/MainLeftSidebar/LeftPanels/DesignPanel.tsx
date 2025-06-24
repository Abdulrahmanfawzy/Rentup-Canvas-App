import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASE_API_URL } from "@/services/api";
import {
  useDeleteTemplateMutation,
  useGetTemplatesQuery,
} from "@/services/templateApi";
import { MoreHorizontalIcon } from "lucide-react";
import { addTemplateId } from "@/features/form/saveFormSlice";
import { useDispatch } from "react-redux";
import { useCanvas } from "@/context/CanvasContext";

export default function DesignPanel() {
  const { handleImport } = useCanvas();
  const {
    data: templates,
    isLoading: isTemplatesLoading,
    refetch,
  } = useGetTemplatesQuery();
  ``;
  const [deleteTemplate, { isLoading: isDeleting }] =
    useDeleteTemplateMutation();

  const handleDelete = async (templateID: number) => {
    await deleteTemplate(templateID);
    refetch();
  };
  const dispatch = useDispatch();
  const handleEdit = (templateID: number, jsonData: string) => {
    dispatch(addTemplateId(templateID));
    handleImport(jsonData);
  };

  if (isTemplatesLoading || isDeleting) return <span>Loading...</span>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Templates</h2>

      <ul className="grid grid-cols-1 gap-4">
        {templates?.map((template) => (
          <li key={template.id} className="border p-2 rounded shadow relative">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 absolute top-2 right-2">
                <MoreHorizontalIcon className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDelete(template.id)}>
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEdit(template.id, template.raw_input)}
                >
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <img
              src={
                template.icon
                  ? `${BASE_API_URL}${template.icon}`
                  : `https://placehold.co/500x500.png?text=${encodeURIComponent(
                      template.name
                    )}`
              }
              alt={template.name}
              className="w-full h-auto mb-2 rounded bg-white object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
