// src/features/marks/components/MarksTable.tsx

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Clock, Lock, Users, Eye } from "lucide-react";
import { format } from "date-fns";
import type { recentBatch } from "../types";

interface Props {
  data: recentBatch[];
  isLoading: boolean;
  isPrincipal: boolean;
  onOpenGrid: (batch: recentBatch) => void;
}

export default function MarksTable({ data, isLoading, isPrincipal, onOpenGrid }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading recent uploads...</div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
            <p>No marks uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((batch) => {
              const canEdit = isPrincipal || batch.is_editable;
              // const canEdit = batch.is_editable;
              const timeLeft = batch.time_left_hours;

              return (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{batch.subject_name}</div>
                      <div className="text-sm text-muted-foreground">{batch.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>{batch.class_name}</TableCell>
                  <TableCell>{batch.term}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {batch.uploaded_by ? (
                        <span className="inline-block max-w-[140px] truncate">
                          {batch.uploaded_by}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </span>

                    {batch.uploaded_at && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(batch.uploaded_at), "dd MMM yyyy")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      timeLeft !== null && timeLeft > 0 ? (
                        <Badge variant="default" className="bg-amber-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {timeLeft}h left
                        </Badge>
                      ) : (
                        <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" /> View only</Badge>
                      )
                    ) : (
                      <Badge variant="secondary">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onOpenGrid(batch)}
                      // disabled={canEdit}
                      // disabled={!canEdit && !isPrincipal}
                      variant={canEdit ? "default" : "outline"}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      {canEdit ? "Edit" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}