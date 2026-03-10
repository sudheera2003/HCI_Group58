"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Calendar,
  Box,
  LogOut,
  User as UserIcon,
  Pencil,
} from "lucide-react";

// Types
type Design = {
  id: string;
  name: string;
  created_at: string;
};

export default function Dashboard() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  // State for DELETE
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for RENAME
  const [projectToRename, setProjectToRename] = useState<Design | null>(null); // Holds the project being edited
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Fetch Data
  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data, error } = await supabase
        .from("designs")
        .select("id, name, created_at, thumbnail")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load designs");
      } else {
        setDesigns(data || []);
      }

      setLoading(false);
    };
    getData();
  }, [supabase, router]);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("designs")
      .delete()
      .eq("id", projectToDelete);

    if (error) {
      toast.error("Error deleting project");
    } else {
      setDesigns(designs.filter((d) => d.id !== projectToDelete));
      toast.success("Project deleted");
    }

    setIsDeleting(false);
    setProjectToDelete(null);
  };

  // Handle Rename
  const openRenameDialog = (design: Design) => {
    setProjectToRename(design);
    setNewName(design.name); // Pre-fill with current name
  };

  const confirmRename = async () => {
    if (!projectToRename || !newName.trim()) return;

    setIsRenaming(true);

    const { error } = await supabase
      .from("designs")
      .update({ name: newName })
      .eq("id", projectToRename.id);

    if (error) {
      toast.error("Failed to rename project");
    } else {
      // Update local state immediately
      setDesigns(
        designs.map((d) =>
          d.id === projectToRename.id ? { ...d, name: newName } : d,
        ),
      );
      toast.success("Project renamed");
      setProjectToRename(null); // Close Dialog
    }

    setIsRenaming(false);
  };

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Box className="w-6 h-6 text-blue-600" />
                Furniture Visualizer
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/editor/new">
                <Button className="hidden sm:flex shadow-sm">
                  <Plus className="w-6 h-6 mr-2" />
                  New Design
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-9 w-9 border border-slate-200">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${userEmail}`}
                      />
                      <AvatarFallback>
                        <UserIcon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        My Account
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Recent Projects
            </h2>
          </div>

          {designs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <h3 className="text-lg font-medium text-slate-900">
                No designs yet
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Create your first room design.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card
                  key={design.id}
                  className="group hover:shadow-lg transition-all duration-200 border-slate-200"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center">
                      <span
                        className="truncate text-lg font-semibold text-slate-800"
                        title={design.name}
                      >
                        {design.name}
                      </span>
                      {/* Rename Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openRenameDialog(design)}
                        title="Rename Project"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-slate-100 rounded-lg flex flex-col items-center justify-center mb-4 border border-slate-100 group-hover:border-slate-200">
                      {design.thumbnail ? (
                        // Show saved preview
                        <img
                          src={design.thumbnail}
                          alt={design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // Fallback if no thumbnail is available
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <Box className="w-8 h-8 mb-2" />
                          <span className="text-xs font-medium">
                            No Preview
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {new Date(design.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Link href={`/editor/${design.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                      >
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Open
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setProjectToDelete(design.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}

      {/* Rename Dialog */}
      <Dialog
        open={!!projectToRename}
        onOpenChange={(open) => !open && setProjectToRename(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectToRename(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={isRenaming}>
              {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
