// src/features/users/components/UserProfile/TeacherScopeCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeacherScopeCard({ scope }: { scope: any }) {
  if (!scope) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Teaching Scope</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(scope.scope).map(([year, buildings]: any) => (
          <div key={year}>
            <h3 className="font-semibold text-lg mb-3">{year}</h3>
            {Object.entries(buildings).map(([dept, forms]: any) => (
              <div key={dept} className="ml-4 mb-4">
                <h4 className="font-medium text-primary">{dept}</h4>
                {Object.entries(forms).map(([form, subjects]: any) => (
                  <div key={form} className="ml-6 mt-2">
                    <Badge variant="secondary">{form}</Badge>
                    <div className="ml-8 mt-1 space-y-1">
                      {subjects.map((s: any) => (
                        <p key={s.assignment_id} className="text-sm">
                          {s.subject_name} ({s.subject_code})
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}