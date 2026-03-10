"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Monitor,
  Grid3X3,
  Save,
  Loader2,
  Move,
  RotateCw,
  Undo2,
  Redo2,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

export default function Toolbar() {
  // Store Hooks
  const {
    is2D,
    toggleViewMode,
    transformMode,
    setTransformMode,
    room,
    furniture,
    walls,
    doors,
    projectId,
    setProjectId,
    projectName,
    setProjectName,

    // History Hooks
    undo,
    redo,
    past,
    future,
  } = useStore();

  // Local State
  const [saving, setSaving] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const supabase = createClient();
  const router = useRouter();

  // Sync local input with store name when dialog opens
  useEffect(() => {
    if (isNameDialogOpen)
      setNameInput(projectName === "Untitled Project" ? "" : projectName);
  }, [isNameDialogOpen, projectName]);

  // Main Click Handler
  const handleSaveClick = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in to save designs.");
      return router.push("/login");
    }

    if (projectId) {
      setIsConfirmDialogOpen(true);
    } else {
      setIsNameDialogOpen(true);
    }
  };

  // Create New Project
  const handleCreate = async () => {
    if (!nameInput.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Capture Screenshot
    const canvas = document.querySelector("canvas");
    const thumbnail = canvas ? canvas.toDataURL("image/jpeg", 0.5) : null;

    try {
      const { data, error } = await supabase
        .from("designs")
        .insert({
          user_id: user.id,
          name: nameInput,
          room_data: room,
          furniture_data: furniture,
          walls_data: walls || [],
          doors_data: doors || [],
          thumbnail: thumbnail,
        })
        .select()
        .single();

      if (error) throw error;

      // Update Store
      setProjectId(data.id);
      setProjectName(data.name);

      toast.success("Project saved successfully!");
      setIsNameDialogOpen(false);

      window.history.replaceState(null, "", `/editor/${data.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Update Existing Project
  const handleUpdate = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const canvas = document.querySelector("canvas");
    const thumbnail = canvas ? canvas.toDataURL("image/jpeg", 0.5) : null;

    try {
      const { error } = await supabase
        .from("designs")
        .update({
          room_data: room,
          furniture_data: furniture,
          walls_data: walls || [],
          doors_data: doors || [],
          thumbnail: thumbnail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Project overwritten successfully!");
      setIsConfirmDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Update failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Main toolbar UI */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
        <div className="flex items-center gap-2 p-2 bg-background/90 backdrop-blur-md border border-border shadow-xl rounded-full px-4 overflow-x-auto">
          {/* Name Display */}
          <div className="hidden md:flex flex-col px-2 mr-2 border-r border-border min-w-[100px]">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Project
            </span>
            <span
              className="text-sm font-semibold text-foreground truncate max-w-[150px]"
              title={projectName}
            >
              {projectName || "Untitled"}
            </span>
          </div>

          {/* UNDO / REDO BUTTONS */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={past.length === 0}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={future.length === 0}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-border mx-1" />

          {/* Transform Tools (Only in 3D) */}
          {!is2D && (
            <>
              <div className="flex bg-muted/50 p-1 rounded-full border border-border">
                {/* Move */}
                <Button
                  variant="ghost"
                  onClick={() => setTransformMode("translate")}
                  size="icon"
                  className={`h-8 w-8 rounded-full transition-all ${transformMode === "translate" ? "bg-background shadow-sm text-primary border border-border" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  title="Move Tool"
                >
                  <Move className="w-4 h-4" />
                </Button>

                {/* Rotate */}
                <Button
                  variant="ghost"
                  onClick={() => setTransformMode("rotate")}
                  size="icon"
                  className={`h-8 w-8 rounded-full transition-all ${transformMode === "rotate" ? "bg-background shadow-sm text-primary border border-border" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  title="Rotate Tool"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-px h-8 bg-border mx-1" />
            </>
          )}

          {/* View Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-full border border-border">
            <Button
              variant="ghost"
              onClick={() => !is2D && toggleViewMode()}
              size="sm"
              className={`h-8 rounded-full px-4 text-xs font-medium transition-all ${is2D ? "bg-background shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Grid3X3 className="w-3.5 h-3.5 mr-2" />
              2D
            </Button>
            <Button
              variant="ghost"
              onClick={() => is2D && toggleViewMode()}
              size="sm"
              className={`h-8 rounded-full px-4 text-xs font-medium transition-all ${!is2D ? "bg-background shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Monitor className="w-3.5 h-3.5 mr-2" />
              3D
            </Button>
          </div>

          <div className="w-px h-8 bg-border mx-1" />

          {/* Save Button */}
          <Button
            onClick={handleSaveClick}
            disabled={saving}
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-foreground hover:bg-muted rounded-full font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">
              {projectId ? "Update" : "Save"}
            </span>
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          {/* User Profile */}
          <UserMenu />
        </div>
      </div>

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save New Project</DialogTitle>
            <DialogDescription>
              Give your design a name to save it to your portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Dream Living Room"
                className="col-span-3 bg-background"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite existing project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the saved version of{" "}
              <span className="font-semibold text-foreground">
                "{projectName}"
              </span>{" "}
              with your current changes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}