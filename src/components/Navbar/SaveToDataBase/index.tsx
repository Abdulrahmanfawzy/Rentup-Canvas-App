import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralForm from "./GeneralForm";

export function SaveToDataBase() {
  return (
    <Dialog defaultOpen={false}>
      <DialogTrigger asChild>
        <Button variant="default">Save</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save</DialogTitle>
          <DialogDescription>
            Fill inputs with template data to save it. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="frames">Template Frames</TabsTrigger>
            <TabsTrigger value="texts">Template Text Boxes</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralForm />
          </TabsContent>
          <TabsContent value="frames">
            Change your template frames here.
          </TabsContent>
          <TabsContent value="texts">
            Change your template text boxes here.
          </TabsContent>
        </Tabs>
        {/*         <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
