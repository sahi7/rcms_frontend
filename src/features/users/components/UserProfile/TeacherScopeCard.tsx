// src/features/users/components/UserProfile/TeacherScopeCard.tsx

import { Badge } from "@/components/ui/badge";

export default function TeacherScopeCard({ scope }: { scope: any }) {
  if (!scope) return null;

  return (
    <div className="space-y-8">
      {Object.entries(scope.scope).map(([year, buildings]: [string, any]) => (
        <div key={year} className="rounded-2xl bg-muted/30 p-6 border">
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            {year}
          </h3>

          <div className="space-y-6">
            {Object.entries(buildings).map(([dept, forms]: [string, any]) => (
              <div key={dept}>
                <h4 className="font-semibold text-foreground/90 mb-3">{dept}</h4>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(forms).map(([form, subjects]: [string, any]) => (
                    <div key={form} className="bg-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
                      <Badge variant="outline" className="mb-3">
                        {form}
                      </Badge>
                      <div className="space-y-2">
                        {subjects.map((s: any) => (
                          <div key={s.assignment_id} className="text-sm">
                            <p className="font-medium">{s.subject_name}</p>
                            <p className="text-muted-foreground text-xs">{s.subject_code}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}