"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Layers, RotateCw, Magnet, DoorOpen } from "lucide-react";

export default function RoomConfig() {
  const {
    room,
    setRoom,
    walls,
    addWall,
    updateWall,
    removeWall,
    rotateItem,
    snapItem,
    selectItem,
    selectedId,
    // DOOR ACTIONS
    doors,
    addDoor,
    updateDoor,
    removeDoor
  } = useStore();

  return (
    // MAIN CARD
    <Card className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md z-10 shadow-xl border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
      
      <div className="flex-shrink-0 bg-white/50 z-20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
            <Layers className="w-4 h-4 text-blue-600" />
            Room Configuration
          </CardTitle>
        </CardHeader>

        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Floor Plan
            </h4>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Width (m)</Label>
                <Input
                  type="number"
                  value={room.width}
                  onChange={(e) => setRoom({ width: Number(e.target.value) })}
                  className="h-8 text-xs"
                  min={2}
                  max={100}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Length (m)</Label>
                <Input
                  type="number"
                  value={room.length}
                  onChange={(e) => setRoom({ length: Number(e.target.value) })}
                  className="h-8 text-xs"
                  min={2}
                  max={100}
                />
              </div>
            </div>

            {/* Floor Color */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative overflow-hidden w-8 h-8 rounded-full border border-slate-200 shadow-sm cursor-pointer">
                <input
                  type="color"
                  value={room.floorColor}
                  onChange={(e) => setRoom({ floorColor: e.target.value })}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                />
              </div>
              <div className="flex flex-col">
                <Label className="text-xs font-medium text-slate-700">
                  Floor Color
                </Label>
                <span className="text-[10px] text-slate-400 uppercase">
                  {room.floorColor}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
      </div>

      {/* BOTTOM SECTION (Walls & Doors) */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-3">
          
          {/* Header for Walls Section */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-500 uppercase">
              Custom Walls
            </h4>
            <Button
              onClick={addWall}
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2"
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          {/* Empty State */}
          {walls.length === 0 && (
            <div className="text-[10px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              No custom walls added.
            </div>
          )}

          {/* Wall List */}
          {walls.map((wall, index) => (
            <div
              key={wall.id}
              className={`p-3 rounded-lg border transition-all ${
                selectedId === wall.id
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => selectItem(wall.id)}
            >
              {/* Header: Name & Actions */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-600">
                  Wall #{index + 1}
                </span>
                <div className="flex gap-0.5">
                  {/* ADD DOOR BUTTON */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:text-green-600 hover:bg-green-100"
                    title="Add Door"
                    onClick={(e) => {
                      e.stopPropagation();
                      addDoor(wall.id);
                    }}
                  >
                    <DoorOpen className="w-3 h-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:text-blue-600 hover:bg-blue-100"
                    title="Snap to Grid"
                    onClick={(e) => {
                      e.stopPropagation();
                      snapItem(wall.id, "wall");
                    }}
                  >
                    <Magnet className="w-3 h-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:text-blue-600 hover:bg-blue-100"
                    title="Rotate 90°"
                    onClick={(e) => {
                      e.stopPropagation();
                      rotateItem(wall.id, "wall");
                    }}
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWall(wall.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Dimensions Input */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <Label className="text-[9px] text-slate-500 mb-1 block">Width</Label>
                  <Input
                    type="number"
                    className="h-6 text-[10px] bg-white"
                    value={wall.width}
                    onChange={(e) =>
                      updateWall(wall.id, { width: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-[9px] text-slate-500 mb-1 block">Height</Label>
                  <Input
                    type="number"
                    className="h-6 text-[10px] bg-white"
                    value={wall.height}
                    onChange={(e) =>
                      updateWall(wall.id, { height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Color Input */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-full flex items-center bg-white border border-slate-200 rounded h-6 px-1 overflow-hidden">
                  <input
                    type="color"
                    value={wall.color}
                    onChange={(e) =>
                      updateWall(wall.id, { color: e.target.value })
                    }
                    className="w-4 h-4 border-none p-0 bg-transparent cursor-pointer mr-2"
                  />
                  <span className="text-[9px] text-slate-500 font-mono uppercase">
                    {wall.color}
                  </span>
                </div>
              </div>

              {/* DOORS LIST FOR THIS WALL */}
              {doors.filter(d => d.wallId === wall.id).map((door, i) => (
                <div 
                  key={door.id} 
                  className="mt-2 pt-2 border-t border-slate-200/50 bg-slate-100/50 rounded-md p-2"
                  onClick={(e) => e.stopPropagation()} // Prevent selecting wall when clicking door inputs
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                       <DoorOpen className="w-2 h-2 text-slate-400"/>
                       <span className="text-[9px] font-bold text-slate-500">Door {i+1}</span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-4 w-4 text-slate-400 hover:text-red-500 hover:bg-red-50" 
                      onClick={() => removeDoor(door.id)}
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <Label className="text-[8px] text-slate-400">Pos</Label>
                      <Input 
                        type="number" className="h-5 text-[9px] px-1 bg-white" 
                        value={door.offset} 
                        onChange={(e) => updateDoor(door.id, { offset: Number(e.target.value) })} 
                      />
                    </div>
                    <div>
                      <Label className="text-[8px] text-slate-400">Width</Label>
                      <Input 
                        type="number" className="h-5 text-[9px] px-1 bg-white" 
                        value={door.width} 
                        onChange={(e) => updateDoor(door.id, { width: Number(e.target.value) })} 
                      />
                    </div>
                    <div>
                      <Label className="text-[8px] text-slate-400">Height</Label>
                      <Input 
                        type="number" className="h-5 text-[9px] px-1 bg-white" 
                        value={door.height} 
                        onChange={(e) => updateDoor(door.id, { height: Number(e.target.value) })} 
                      />
                    </div>
                  </div>
                </div>
              ))}

            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}