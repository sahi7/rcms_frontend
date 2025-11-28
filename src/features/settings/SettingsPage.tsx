// src/features/settings/SettingsPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  School, 
  Calendar, 
  Building2, 
  Users, 
  Palette, 
  Bell, 
  Upload
} from "lucide-react";
import AcademicYearsManager from "./components/AcademicYearsManager";
import DepartmentsManager from "./components/DepartmentsManager";
import ClassesManager from "./components/ClassesManager";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your school configuration and preferences</p>
      </div>

      <Tabs defaultValue="school" className="w-full">
        {/* Mobile: Horizontal scrollable tabs */}
        <div className="overflow-x-auto pb-2 -mb-2">
          <TabsList className="inline-flex w-max rounded-lg bg-muted p-1">
            <TabsTrigger value="school" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">School</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Academic Years</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Departments</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* School Info */}
        <TabsContent value="school" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <School className="h-6 w-6" />
                School Information
              </CardTitle>
              <CardDescription>
                Update your school's name, logo, and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="school-name">School Name</Label>
                    <Input id="school-name" placeholder="e.g. Greenfield High School" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="motto">School Motto</Label>
                    <Input id="motto" placeholder="e.g. Excellence in Education" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" placeholder="admin@school.edu" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" className="mt-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>School Logo</Label>
                    <div className="mt-3 flex items-center justify-center">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl w-48 h-48 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="bg-muted rounded-full p-4">
                          <School className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <Button variant="ghost" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="address">School Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="123 Education Street, Learning City, 90210"
                  className="mt-2 min-h-24"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Years */}
        <TabsContent value="academic" className="mt-6">
          <AcademicYearsManager />
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="mt-6">
          <DepartmentsManager />
        </TabsContent>

        {/* Classes */}
        <TabsContent value="classes" className="mt-6">
          <ClassesManager />
        </TabsContent>

        {/* Appearance (Future) */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-6 w-6" />
                Appearance
              </CardTitle>
              <CardDescription>Customize colors and themes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications (Future) */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bell className="h-6 w-6" />
                Notifications
              </CardTitle>
              <CardDescription>Configure email and push notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}