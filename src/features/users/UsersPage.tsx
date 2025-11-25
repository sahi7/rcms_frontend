import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import UsersTable from "./components/UsersTable";
import CreateUserDialog from "./components/CreateUserDialog";

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-4xl font-bold">Users & Teachers</h1>
                        <p className="text-muted-foreground text-sm lg:text-base">
                            Manage teachers, students, and parents
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} size="sm" className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        New User
                    </Button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-auto">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="teacher">Teachers</TabsTrigger>
                            <TabsTrigger value="student">Students</TabsTrigger>
                            <TabsTrigger value="parent">Parents</TabsTrigger>
                        </TabsList>

                        {["all", "teacher", "student", "parent"].map((role) => (
                            <TabsContent key={role} value={role}>
                                <UsersTable role={role === "all" ? undefined : role} search={search} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            </div>
        </div>
    );
}