import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Users, Calendar, Building2, Edit, Trash2, User, School, Clock, AlertTriangle } from "lucide-react";
import AssignmentForm from "./AssignmentForm";
import { useDeleteAssignment } from "../hooks/useAssignments";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Assignment {
  id: number;
  subject: string;
  teacher: string;
  department: number;
  academic_year: string;
  class_rooms: number[];
}

interface RefData {
  departments: { id: number; name: string }[];
  classrooms: { id: number; name: string }[];
  academic_years: { id: string; name: string }[];
  teachers: { id: number; full_name: string }[];
}

interface Props {
  assignment: Assignment;
  refData: RefData;
  subjectName: string;
  subjectId: number;
}

export default function AssignmentCard({ assignment, refData, subjectName, subjectId }: Props) {
  const deleteMutation = useDeleteAssignment();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deptName = refData.departments.find(d => d.id === assignment.department)?.name || "All Departments";
  const academicYearName = refData.academic_years.find(y => y.id === assignment.academic_year)?.name || "Unknown Year";
  const teacherName = refData.teachers.find(t => t.id === Number(assignment.teacher))?.full_name || assignment.teacher;
  const classNames = assignment.class_rooms
    .map(id => refData.classrooms.find(c => c.id === id)?.name)
    .filter(Boolean);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = () => {
    deleteMutation.mutate(assignment.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Assignment
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 mb-4 p-3 bg-destructive/5 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Are you sure you want to remove this assignment?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {teacherName} will no longer teach {subjectName} to {classNames.length} class{classNames.length !== 1 ? 'es' : ''}.
                </p>
              </div>
            </div>
            
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{teacherName}</p>
                  <p className="text-xs text-muted-foreground">Teacher</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <School className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{subjectName}</p>
                  <p className="text-xs text-muted-foreground">Subject</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{deptName}</p>
                  <p className="text-xs text-muted-foreground">Department</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Remove Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden border hover:border-primary/30 transition-all duration-200 bg-gradient-to-r from-white to-primary/5">
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            {/* Teacher Avatar & Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(teacherName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                  <h4 className="font-semibold text-lg text-foreground truncate">{teacherName}</h4>
                  <Badge variant="outline" className="w-fit gap-1">
                    <User className="h-3 w-3" />
                    Teacher
                  </Badge>
                </div>
                
                {/* Assignment Details */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{academicYearName}</span>
                  </div>
                  
                  <div className="hidden sm:block text-muted-foreground/50">•</div>
                  
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">{deptName}</span>
                  </div>
                  
                  <div className="hidden sm:block text-muted-foreground/50">•</div>
                  
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{classNames.length} class{classNames.length !== 1 ? 'es' : ''}</span>
                  </div>
                </div>
                
                {/* Classes Badges */}
                {classNames.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned Classes</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {classNames.length} total
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classNames.map((name, i) => (
                        <Badge key={i} variant="outline" className="gap-1.5 pl-2 pr-3 py-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span className="font-medium">{name}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Right Side */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:ml-auto md:mt-1">
              <AssignmentForm
                subjectId={subjectId}
                subjectName={subjectName}
                assignment={assignment}
                refData={refData}
                trigger={
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                }
              />

              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove</span>
              </Button>
            </div>
          </div>

          {/* Subject Info Footer */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded">
                <School className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Teaching <span className="font-semibold text-foreground">{subjectName}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}