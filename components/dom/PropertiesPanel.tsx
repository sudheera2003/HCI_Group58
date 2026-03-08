"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, RotateCw, Magnet, X } from "lucide-react";

export default function PropertiesPanel() {
  // Get State & Actions
  const {
    selectedId,
    furniture,
    addFurniture,
    updateFurniture,
    removeFurniture,
    rotateItem, // <--- New Action
    snapItem,   // <--- New Action
    selectItem
  } = useStore();

  // Find the currently selected object data
  const selectedItem = furniture.find((f) => f.id === selectedId);

  return (
    <Card className="absolute top-20 right-4 w-72 bg-white/95 backdrop-blur-md z-10 shadow-xl border-slate-200">
      
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-800">
          {selectedItem ? "Edit Item" : "Add Furniture"}
        </CardTitle>
        {selectedItem && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => selectItem(null)}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        
        {/* --- CASE 1: NOTHING SELECTED (Show Add Buttons) --- */}
        {!selectedItem && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Select a category to add to the room:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50" onClick={() => addFurniture("chair")}>
                <span className="text-xs font-medium">Chair</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50" onClick={() => addFurniture("table")}>
                <span className="text-xs font-medium">Table</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 col-span-2 hover:border-blue-500 hover:bg-blue-50" onClick={() => addFurniture("bed")}>
                <span className="text-xs font-medium">Bed</span>
              </Button>
            </div>
          </div>
        )}

        {/* --- CASE 2: ITEM SELECTED (Show Properties) --- */}
        {selectedItem && (
          <div className="space-y-5">
            
            {/* Info Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold text-sm capitalize text-slate-800">
                {selectedItem.type}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                #{selectedItem.id.slice(0, 4)}
              </span>
            </div>

            {/* NEW: Quick Actions (Rotate & Snap) */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs"
                onClick={() => rotateItem(selectedItem.id, 'furniture')}
              >
                <RotateCw className="w-3 h-3 mr-2 text-blue-600" />
                Rotate 90°
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs"
                onClick={() => snapItem(selectedItem.id, 'furniture')}
                title="Snap to nearest 0.5m grid"
              >
                <Magnet className="w-3 h-3 mr-2 text-purple-600" />
                Snap Grid
              </Button>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Color</Label>
              <div className="flex items-center gap-2">
                <div className="relative w-full h-9 rounded-md border border-slate-200 overflow-hidden flex items-center px-2 bg-slate-50">
                  <input
                    type="color"
                    value={selectedItem.color}
                    onChange={(e) => updateFurniture(selectedItem.id, { color: e.target.value })}
                    className="w-6 h-6 border-none p-0 bg-transparent cursor-pointer mr-2"
                  />
                  <span className="text-xs font-mono text-slate-600 uppercase">
                    {selectedItem.color}
                  </span>
                </div>
              </div>
            </div>

            {/* Scale Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                 <Label className="text-xs text-slate-500">Size / Scale</Label>
                 <span className="text-xs font-bold text-slate-700">{selectedItem.scale[0].toFixed(1)}x</span>
              </div>
              <Slider
                defaultValue={[selectedItem.scale[0]]}
                max={3}
                min={0.5}
                step={0.1}
                value={[selectedItem.scale[0]]} // Controlled component
                onValueChange={(val) => {
                  const s = val[0];
                  updateFurniture(selectedItem.id, { scale: [s, s, s] });
                }}
                className="py-2"
              />
            </div>

            {/* Delete Button */}
            <Button
              variant="destructive"
              className="w-full h-9 text-xs mt-4"
              onClick={() => removeFurniture(selectedItem.id)}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete Item
            </Button>

          </div>
        )}
      </CardContent>
    </Card>
  );
}