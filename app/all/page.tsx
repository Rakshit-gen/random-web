"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Site {
  _id: string;
  url: string;
  title: string;
  category: string;
  genres: string[];
  year: number;
  description: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AllPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSites = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sites?page=${page}&limit=20`);

      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }

      const data = await response.json();
      setSites(data.sites);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to load websites. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && sites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Loading websites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">All Websites</h1>
        <p className="text-slate-600">
          {pagination ? `${pagination.total} websites` : "Browse all websites"}
        </p>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-600">
            No websites found. Be the first to add one!
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {sites.map((site) => (
              <Card key={site._id}>
                <CardHeader>
                  <CardTitle className="text-lg">{site.title}</CardTitle>
                  <CardDescription>
                    {site.category} • {site.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {site.description}
                  </p>
                  
                  {site.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {site.genres.slice(0, 3).map((genre, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => window.open(site.url, "_blank", "noopener,noreferrer")}
                  >
                    Visit Website <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
