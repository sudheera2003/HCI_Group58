"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Optional: for error notifications

import Scene from "@/components/canvas/Scene";
import Toolbar from "@/components/dom/Toolbar";
import PropertiesPanel from "@/components/dom/PropertiesPanel";
import RoomConfig from "@/components/dom/RoomConfig";

export default function EditorPage() {
  const params = useParams();
  // Ensure projectId is a string
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  
  const supabase = createClient();
  const router = useRouter();

  // Get Store Actions
  const loadDesign = useStore((state) => state.loadDesign);
  const setProjectId = useStore((state) => state.setProjectId);
  const setProjectName = useStore((state) => state.setProjectName);
  const reset = useStore((state) => state.reset);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initEditor = async () => {
      if (!projectId) return;

      // --- CASE 1: NEW PROJECT ---
      if (projectId === "new") {
        reset(); // Clear previous state
        setLoading(false);
        return;
      }

      // --- CASE 2: EXISTING PROJECT ---
      try {
        const { data, error } = await supabase
          .from("designs")
          .select("*")
          .eq("id", projectId)
          .single();

        if (error) throw error;
        
        if (!data) {
          throw new Error("Project not found");
        }

        // 1. Load Data into Store
        loadDesign({
          room: data.room_data,
          furniture: data.furniture_data || [], // Safety fallback
          walls: data.walls_data || [],
          doors: data.doors_data || [],
        });

        // 2. Set Project Metadata
        setProjectId(data.id);
        setProjectName(data.name);

      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Failed to load project");
        // Optional: router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initEditor();
  }, [projectId, loadDesign, setProjectId, setProjectName, reset]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Loading your design...</h2>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      <div className="flex-1 relative w-full h-full">
        {/* The 3D Scene fills this container */}
        <Scene />
        
        {/* UI Overlays (Absolute Positioned inside their components) */}
        <RoomConfig />
        <Toolbar />
        <PropertiesPanel />
      </div>
    </main>
  );
}