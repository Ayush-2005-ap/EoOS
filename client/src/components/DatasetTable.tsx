"use client";

import { useState, useEffect } from "react";
import { Search, Database, Lock } from "lucide-react";

export default function DatasetTable({ isFullPage = false }: { isFullPage?: boolean }) {
  const [dataset, setDataset] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/dataset`)
      .then(res => res.json())
      .then(json => {
        // If data is an object, it hasn't been re-uploaded yet. Convert to 2D array if possible, or wait.
        let rawData = json.data || [];
        if (rawData.length > 0 && !Array.isArray(rawData[0])) {
          // It's still using the old JSON format. Wait for re-upload.
          rawData = [["Please re-upload your Excel file from the Admin panel to view the new layout."]];
        }
        setDataset(rawData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-outline-variant/30">
        <div className="animate-pulse flex flex-col items-center gap-2 text-primary">
          <Database size={32} className="animate-bounce" />
          <p className="font-plus-jakarta font-semibold text-sm">Loading Raw Dataset...</p>
        </div>
      </div>
    );
  }

  if (dataset.length === 0) return null;

  // Filter 2D array
  const filteredData = dataset.filter(row => {
    if (!searchTerm) return true;
    return row.some(cell => String(cell || "").toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden select-none flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest shrink-0">
        <div>
          <h2 className="font-plus-jakarta text-xl font-extrabold text-primary flex items-center gap-2">
            <Database className="text-secondary" size={20} /> Field Research Dataset
          </h2>
          
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            placeholder="Search across all data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
          />
        </div>
      </div>

      <div className={`overflow-auto custom-scrollbar ${isFullPage ? "h-[75vh]" : "max-h-[600px]"}`}>
        <table className="w-full text-left border-collapse min-w-max">
          <tbody>
            {filteredData.length > 0 ? filteredData.map((row, rowIndex) => {
              // Determine row style based on content
              const firstCellString = String(row[0] || "");
              const secondCellString = String(row[1] || "");
              
              let rowClass = "border-b border-outline-variant/30 hover:bg-secondary/5 transition-colors text-[13px] text-on-surface";
              let textClass = "";

              if (firstCellString.toUpperCase().includes("DOMAIN")) {
                rowClass += " bg-[#82c582] sticky top-0 z-10 font-extrabold shadow-sm";
                textClass = "text-black";
              } else if (firstCellString.match(/^\d+\./) || secondCellString.includes("Scoring Rule")) {
                rowClass += " bg-[#ffc000] font-bold";
                textClass = "text-black";
              } else if (rowIndex < 2 && !firstCellString.toUpperCase().includes("DOMAIN")) {
                // Header rows (State names, response/score)
                rowClass += " bg-[#4a86e8] text-white font-bold sticky top-0 z-10 shadow-sm";
                textClass = "text-white";
              }

              return (
                <tr key={rowIndex} className={rowClass}>
                  {row.map((cell, colIndex) => {
                    const isFirstCol = colIndex === 0;
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-4 py-2.5 border-r border-outline-variant/30 whitespace-pre-wrap max-w-sm align-top ${textClass} ${isFirstCol ? "font-semibold bg-white/5" : ""}`}
                        style={{ minWidth: isFirstCol ? "300px" : "150px" }}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            }) : (
              <tr>
                <td className="px-6 py-8 text-center text-slate-500 italic">
                  No matching data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
