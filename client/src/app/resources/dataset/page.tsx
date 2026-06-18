"use client";

import { ChevronLeft, Database, Download } from "lucide-react";
import Link from "next/link";
import DatasetTable from "@/components/DatasetTable";

export default function DatasetPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/resources" 
            className="p-2 bg-surface-container hover:bg-outline-variant/30 text-on-surface-variant rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
              <Database className="text-secondary" /> Raw Field Dataset
            </h1>
            <p className="text-on-surface-variant mt-1">Complete breakdown of scoring data across all 30 evaluated states.</p>
          </div>
        </div>


        {/* The full width dataset table */}
        <DatasetTable isFullPage={true} />
      </div>
    </div>
  );
}
