"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Loader2,
  Calendar,
  Box,
  Pencil,
  MoreVertical,
  Search,
  LayoutGrid,
  Sun,
  Moon,
} from "lucide-react";

import { UserMenu } from "@/components/dom/UserMenu"; // Adjust this import path to where your UserMenu is located!

// Types
type Design = {
  id: string;
  name: string;
  created_at: string;
  thumbnail?: string;
};

export default function Dashboard() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // State for DELETE
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for RENAME
  const [projectToRename, setProjectToRename] = useState<Design | null>(null);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // State for "New Design" Loading
  const [isCreating, setIsCreating] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  
  // Theme Hook
  const { theme, setTheme, systemTheme } = useTheme();

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

  // Global Keyboard Listener for 'D'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        isRenaming
      ) {
        return;
      }

      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        const currentTheme = theme === 'system' ? systemTheme : theme;
        if (currentTheme === 'dark') {
          setTheme('light');
          toast.success("Switched to Light Mode");
        } else {
          setTheme('dark');
          toast.success("Switched to Dark Mode");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, systemTheme, setTheme, isRenaming]);

  // Actions
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from("designs").delete().eq("id", projectToDelete);

    if (error) {
      toast.error("Error deleting project");
    } else {
      setDesigns(designs.filter((d) => d.id !== projectToDelete));
      toast.success("Project deleted");
    }
    setIsDeleting(false);
    setProjectToDelete(null);
  };

  const openRenameDialog = (design: Design) => {
    setProjectToRename(design);
    setNewName(design.name);
  };

  const confirmRename = async () => {
    if (!projectToRename || !newName.trim()) return;
    setIsRenaming(true);
    const { error } = await supabase.from("designs").update({ name: newName }).eq("id", projectToRename.id);

    if (error) {
      toast.error("Failed to rename project");
    } else {
      setDesigns(designs.map((d) => (d.id === projectToRename.id ? { ...d, name: newName } : d)));
      toast.success("Project renamed");
      setProjectToRename(null);
    }
    setIsRenaming(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    router.push("/editor/new");
  };

  // Filter Logic
  const filteredDesigns = designs.filter((design) =>
    design.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Box className="w-5 h-5 text-primary" />
                </div>
                Furniture Visualizer
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Theme Toggle Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserMenu />
              
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Studio Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-muted/50 border border-border p-8 sm:p-12 flex flex-col justify-center">
          <LayoutGrid className="absolute -right-10 -bottom-10 w-64 h-64 text-primary/5 -rotate-12" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome to your Studio
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                {designs.length > 0 
                  ? `You have ${designs.length} projects in your workspace. Pick up where you left off or start a fresh design.`
                  : "Your workspace is empty. Start visualizing your dream room today."}
              </p>
              
              {/* Keyboard Shortcut Hint */}
              <div className="inline-flex items-center text-xs text-muted-foreground bg-background border border-border px-2 py-1 rounded-md mt-2 shadow-sm">
                <span className="font-medium mr-1 border border-border bg-muted px-1.5 rounded text-[10px]">D</span>
                Press to toggle dark mode
              </div>

            </div>
            <Button 
              size="lg" 
              className="h-12 px-8 shadow-lg shadow-primary/20 font-semibold text-base"
              onClick={handleCreateNew} 
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              Create New Space
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* HEADER & SEARCH BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight">
                Recent Projects
              </h3>
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {designs.length}
              </span>
            </div>
            
            {designs.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search your designs..."
                  className="pl-9 bg-background border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* DYNAMIC CONTENT RENDERING */}
          {designs.length === 0 ? (
            
            /* EMPTY STATE: Brand New User */
            <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-xl border border-dashed border-border">
              <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border border-border flex items-center justify-center mb-6">
                <Box className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No designs yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-sm text-center">
                Your creative journey begins here. Click the button above to launch the 3D editor.
              </p>
            </div>

          ) : filteredDesigns.length === 0 ? (

            /* No Search Results */
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">
                No results found
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                We couldn't find any projects matching "{searchQuery}".
              </p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-primary">
                Clear filters
              </Button>
            </div>

          ) : (

            /* PROJECT GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDesigns.map((design) => (
                <Card
                  key={design.id}
                  className="group flex flex-col border-border bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
                >
                  {/* HOVER OVERLAY */}
                  <div className="relative h-56 bg-muted overflow-hidden flex-shrink-0 border-b border-border">
                    {design.thumbnail ? (
                      <img
                        src={design.thumbnail}
                        alt={design.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      /* Blueprint styled fallback */
                      <div className="flex w-full h-full flex-col items-center justify-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]">
                        <Box className="w-12 h-12 text-muted-foreground/30 mb-2" />
                        <span className="text-xs font-medium text-muted-foreground/50 tracking-widest uppercase">Draft</span>
                      </div>
                    )}

                    {/* Glassmorphism Hover Overlay */}
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        onClick={() => router.push(`/editor/${design.id}`)}
                        className="shadow-lg scale-95 group-hover:scale-100 transition-transform duration-300"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Space
                      </Button>
                    </div>
                  </div>

                  {/* Card Content & Three Dots Menu */}
                  <CardContent className="p-5 flex items-start justify-between bg-card">
                    <div className="overflow-hidden space-y-1.5">
                      <h3 className="font-semibold text-lg leading-none truncate pr-4" title={design.name}>
                        {design.name}
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {new Date(design.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 -mr-2 -mt-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openRenameDialog(design)} className="cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setProjectToDelete(design.id)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/*  DIALOGS */}
      <Dialog open={!!projectToRename} onOpenChange={(open) => !open && setProjectToRename(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your 3D space.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-muted-foreground">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3 bg-background"
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

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove your design data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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