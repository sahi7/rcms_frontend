// src/features/marks/components/MarksOverview.tsx
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Upload, Calendar, Target, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarksOverview } from "../types";

interface Props {
  uploadStat?: MarksOverview;
  isLoading: boolean;
}

interface Term {
  id: string;
  name: string;
  is_current: boolean;
}

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

export default function MarksOverview({ uploadStat, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 sm:h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!uploadStat) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Marks Data</h3>
        <p className="text-sm text-muted-foreground">Upload marks to see overview</p>
      </div>
    );
  }

  const { total_expected, uploaded, percentage, term, academic_year } = uploadStat;
  const remaining = total_expected - uploaded;

  const { data: allTerms = [] } = useQuery<Term[]>({
    queryKey: ["terms"],
    queryFn: async () => {
      const res = await api.get("/terms/");
      return res.data as Term[];
    },
    staleTime: Infinity,
  });

  const { data: allYears = [] } = useQuery<AcademicYear[]>({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await api.get("/academic-years/");
      return res.data as AcademicYear[];
    },
    staleTime: Infinity,
  });
  
  // Find current year & term and set as default
  const currentTerm = allTerms.find(t => t.is_current);
  const year = allYears.find(y => y.id === uploadStat.academic_year);

  // Determine status
  const getStatusText = (percent: number) => {
    if (percent >= 100) return "Complete";
    if (percent >= 75) return "Good Progress";
    if (percent >= 50) return "In Progress";
    return "Needs Attention";
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return "text-green-600 bg-green-50 border-green-200";
    if (percent >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percent >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs h-5">
              <Calendar className="h-3 w-3 mr-1" />
              {currentTerm?.name || `Term ${term}`}
            </Badge>
            <Badge variant="secondary" className="text-xs h-5">
              {year?.name || academic_year?.slice(0, 10) || "Current Year"}
            </Badge>
          </div>
        </div>
        {/* Minimal Progress Indicator (without bar) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
          <div className={`h-2 w-2 rounded-full ${percentage >= 100 ? 'bg-green-500' : percentage >= 75 ? 'bg-blue-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {uploaded} of {total_expected} assessments uploaded
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(percentage)}`}>
          {getStatusText(percentage)}
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Total Expected - Ultra compact */}
        <Card className="border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-lg sm:text-2xl font-bold">{total_expected}</p>
              </div>
              <div className="relative">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded - Ultra compact */}
        <Card className="border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Uploaded</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{uploaded}</p>
              </div>
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Remaining - Ultra compact */}
        <Card className="border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-10 h-10 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Remaining</p>
                <p className={`text-lg sm:text-2xl font-bold ${remaining > 0 ? "text-amber-600" : "text-green-600"}`}>
                  {remaining}
                </p>
              </div>
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Percentage - Ultra compact */}
        <Card className="border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Complete</p>
                <p className="text-lg sm:text-2xl font-bold">{percentage.toFixed(0)}%</p>
              </div>
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}