// src/features/marks/components/MarksOverview.tsx

import { CheckCircle2, Clock, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentBatch {
  id: string;
  group_key: string;
  subject_name: string;
  department: string;
  class_name: string;           // ← Now single class
  term: string;
  uploaded_by: string;
  uploaded_at: string | null;
  is_editable: boolean;
  time_left_hours: number | null;
}

interface Props {
  recentBatches?: RecentBatch[];
  isLoading: boolean;
  isPrincipal: boolean;
}

export default function MarksOverview({ recentBatches = [], isLoading, isPrincipal }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentBatches.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <div className="text-2xl text-muted-foreground">No marks uploaded yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          Marks Upload Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {recentBatches.length} upload(s) recorded
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recentBatches.map((batch) => {
            const isLocked = !batch.is_editable;
            const hasTimeLeft = batch.time_left_hours !== null && batch.time_left_hours > 0;

            return (
              <div
                key={batch.group_key}
                className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg truncate pr-3">
                    {batch.subject_name}
                  </h3>
                  {isLocked ? (
                    <Lock className="h-6 w-6 text-red-600 flex-shrink-0" />
                  ) : hasTimeLeft ? (
                    <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Class:</span>{" "}
                    <span className="font-medium">{batch.class_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Term:</span>{" "}
                    <span className="font-medium">{batch.term}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {isLocked ? (
                      <Badge variant="secondary">Locked</Badge>
                    ) : hasTimeLeft ? (
                      <Badge className="bg-amber-600">
                        {batch.time_left_hours}h left
                      </Badge>
                    ) : (
                      <Badge variant="default">Editable</Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}