// src/features/reports/pages/DownloadsPage.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileArchive, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useReferenceData } from "@/features/settings/subjects/hooks/useReferenceData";

interface ReportJob {
  id: string;
  academic_year_id: string;
  term: number;  // term ID (number)
  class_room_id: number;
  department_id: number;
  total_students: number;
  created_at: string;
  zip_file_url: string;
}

export default function DownloadsPage() {
  const { data: refData } = useReferenceData();
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useQuery<ReportJob[], Error>({
    queryKey: ["report-downloads"],
    queryFn: async () => {
      const res = await api.get("/reports/downloads/");
      return res.data as ReportJob[];
    },
  });

  // Frontend filtering & search
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const yearMatch = filterYear === "all" || job.academic_year_id === filterYear;
      const termMatch = filterTerm === "all" || job.term.toString() === filterTerm;

      const yearName = refData?.academic_years.find(y => y.id === job.academic_year_id)?.name || "";
      const termName = refData?.terms?.find(t => t.id === job.term)?.name || `Term ${job.term}`;
      const className = refData?.classrooms.find(c => c.id === job.class_room_id)?.name || "";
      const deptName = refData?.departments.find(d => d.id === job.department_id)?.name || "";

      const searchLower = search.toLowerCase();
      const searchMatch =
        yearName.toLowerCase().includes(searchLower) ||
        termName.toLowerCase().includes(searchLower) ||
        className.toLowerCase().includes(searchLower) ||
        deptName.toLowerCase().includes(searchLower);

      return yearMatch && termMatch && searchMatch;
    });
  }, [jobs, refData, search, filterYear, filterTerm]);

  const handleDownload = async (url: string, filename: string) => {
    setDownloadingId(url);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const getYearName = (id: string) => refData?.academic_years.find(y => y.id === id)?.name || "Unknown";
  const getTermName = (termId: number) => refData?.terms?.find(t => t.id === termId)?.name || `Term ${termId}`;
  const getClassName = (id: number) => refData?.classrooms.find(c => c.id === id)?.name || "Unknown";
  const getDeptName = (id: number) => refData?.departments.find(d => d.id === id)?.name || "Unknown";

  if (isLoading) {
    return <div className="p-8 text-center text-lg">Loading previous reports...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileArchive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">No generated report cards yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Download Report Cards</h1>
      <p className="text-muted-foreground mb-8">
        Search and download previously generated report card packages
      </p>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Search by year, term, class, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger>
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {refData?.academic_years.map((y) => (
              <SelectItem key={y.id} value={y.id}>
                {y.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTerm} onValueChange={setFilterTerm}>
          <SelectTrigger>
            <SelectValue placeholder="All Terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {refData?.terms?.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Academic Year</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{getYearName(job.academic_year_id)}</TableCell>
                <TableCell>{getTermName(job.term)}</TableCell>
                <TableCell>{getClassName(job.class_room_id)}</TableCell>
                <TableCell>{getDeptName(job.department_id)}</TableCell>
                <TableCell>{job.total_students}</TableCell>
                <TableCell>{format(new Date(job.created_at), "PPp")}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        job.zip_file_url,
                        `report_cards_${getYearName(job.academic_year_id).replace("/", "-")}_${getTermName(job.term)}.zip`
                      )
                    }
                    disabled={downloadingId === job.zip_file_url}
                  >
                    {downloadingId === job.zip_file_url ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Cards */}
      <div className="grid gap-6 lg:hidden md:grid-cols-2">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {getYearName(job.academic_year_id)} • {getTermName(job.term)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getClassName(job.class_room_id)} — {getDeptName(job.department_id)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generated: {format(new Date(job.created_at), "PPP 'at' p")}
                <br />
                Students: {job.total_students}
              </p>
              <Button
                onClick={() =>
                  handleDownload(
                    job.zip_file_url,
                    `report_cards_${getYearName(job.academic_year_id).replace("/", "-")}_${getTermName(job.term)}.zip`
                  )
                }
                className="w-full"
                disabled={downloadingId === job.zip_file_url}
              >
                {downloadingId === job.zip_file_url ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No reports match your filters.</p>
        </div>
      )}
    </div>
  );
}