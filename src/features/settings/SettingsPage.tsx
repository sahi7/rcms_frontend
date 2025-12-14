// src/features/settings/SettingsPage.tsx
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  School,
  Calendar,
  Building2,
  Users,
  Palette,
  Bell,
  Edit3,
  Check,
  X
} from "lucide-react";
import AcademicYearsManager from "./components/AcademicYearsManager";
import DepartmentsManager from "./components/DepartmentsManager";
import ClassesManager from "./components/ClassesManager";

interface SchoolSettings {
  id: string;
  school_name: string;
  short_name: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string | null | File;
  logo_dark: string | null | File;
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  report_card_header_color: string;
  report_card_border_color: string;
  grade_a_color: string;
  grade_f_color: string;
  pdf_footer_text: string;
}

// Use Query for fetch (single GET, cached)
const useSchoolSettings = () => useQuery<SchoolSettings>({
  queryKey: ["school-settings"],
  queryFn: async () => {
    const res = await api.get("/settings/current/");
    return res.data as SchoolSettings;
  },
});

// Mutation for save
const useSaveSettings = () => useMutation({
  mutationFn: async (data: FormData) => await api.patch("/settings/update-branding/", data),
  onSuccess: () => toast.success("Saved successfully"),
  onError: () => toast.error("Save failed"),
});

export default function SettingsPage() {
  const { data: settings, isLoading: isSettingsLoading, refetch } = useSchoolSettings();
  const saveMutation = useSaveSettings();

  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SchoolSettings>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);

  // Prefill on load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setLogoPreview(settings?.logo as string || null);
      setLogoDarkPreview(settings?.logo_dark as string || null);
    }
  }, [settings]);

  const handleFileSelect = (file: File, type: "logo" | "logo_dark") => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        [type]: file,
      }));
      if (type === "logo") setLogoPreview(preview);
      else setLogoDarkPreview(preview);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      // Skip undefined or null values
      if (value === undefined || value === null) return;

      // If it's a File (new upload), append the file
      if (value instanceof File) {
        submitData.append(key, value);
        return;
      }

      // If it's a string that looks like a URL (existing logo), skip appending
      // This prevents re-sending the old logo URL as a string
      if (typeof value === "string" && value.startsWith("http")) {
        return; // Do not append — backend already has it
      }
      submitData.append(key, String(value));
    });

    try {
      const res = await saveMutation.mutateAsync(submitData);
      const updatedData = res.data as SchoolSettings;

      setFormData(updatedData);
      setLogoPreview(typeof updatedData.logo === "string" ? updatedData.logo : null);
      setLogoDarkPreview(typeof updatedData.logo_dark === "string" ? updatedData.logo_dark : null);
      // await saveMutation.mutateAsync(submitData);
      setEditMode(false);
      // await refetch(); // Reload fresh data 
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings || {});
    setLogoPreview(settings?.logo as string || null);
    setLogoDarkPreview(settings?.logo_dark as string || null);
    setEditMode(false);
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <School className="h-6 w-6" />
                  School Information
                </CardTitle>
                <CardDescription>
                  {editMode ? "Edit your school details" : "View and update school branding"}
                </CardDescription>
              </div>
              {!editMode ? (
                <Button onClick={() => setEditMode(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Check className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Text Fields */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>School Name</Label>
                      <Input
                        value={formData.school_name || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, school_name: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Name</Label>
                      <Input
                        value={formData.short_name || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, short_name: e.target.value }))}
                        placeholder="e.g. GHS Bamenda"
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Motto</Label>
                      <Input
                        value={formData.motto || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, motto: e.target.value }))}
                        placeholder="e.g. Excellence in Education"
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={formData.phone || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={formData.website || ""}
                        onChange={(e) => {
                          let val = e.target.value.trim();
                          if (val && !val.startsWith('http')) val = 'https://' + val;
                          setFormData(prev => ({ ...prev, website: val }));
                        }}
                        placeholder="https://school.edu"
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={formData.address || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full school address"
                      className="min-h-32"
                      disabled={!editMode}
                    />
                  </div>
                </div>

                {/* Right: Logos */}
                <div className="space-y-6">
                  {/* Light Logo */}
                  <div className="space-y-3">
                    <Label>School Logo (Light Mode)</Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${editMode ? "hover:border-primary/50" : ""
                        }`}
                      onDragOver={(e) => {
                        if (editMode) {
                          e.preventDefault();
                          // Visual feedback
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        }
                      }}
                      onDragLeave={(e) => {
                        if (editMode) {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }
                      }}
                      onDrop={(e) => {
                        if (editMode) {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) handleFileSelect(file, "logo");
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }
                      }}
                      onClick={() => editMode && logoInputRef.current?.click()}
                    >
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "logo")}
                        disabled={!editMode}
                      />
                      {logoPreview ? (
                        <div className="space-y-3">
                          <img src={logoPreview} alt="Logo preview" className="mx-auto max-h-48 rounded-lg" />
                          {editMode && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setLogoPreview(null);
                                setFormData(prev => ({ ...prev, logo: null }));
                              }}
                            >
                              Remove Logo
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-muted rounded-full p-6 mx-auto w-fit">
                            <School className="h-16 w-16 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Drop logo here or click to upload</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG recommended, max 2MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dark Logo */}
                  <div className="space-y-3">
                    <Label>Logo (Dark Mode) <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${editMode ? "hover:border-primary/50" : ""
                        }`}
                      onDragOver={(e) => {
                        if (editMode) {
                          e.preventDefault();
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        }
                      }}
                      onDragLeave={(e) => {
                        if (editMode) {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }
                      }}
                      onDrop={(e) => {
                        if (editMode) {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) handleFileSelect(file, "logo_dark");
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }
                      }}
                      onClick={() => editMode && logoDarkInputRef.current?.click()}
                    >
                      <input
                        ref={logoDarkInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "logo_dark")}
                        disabled={!editMode}
                      />
                      {logoDarkPreview ? (
                        <div className="space-y-3">
                          <img src={logoDarkPreview} alt="Dark logo preview" className="mx-auto max-h-48 rounded-lg bg-muted p-4" />
                          {editMode && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setLogoDarkPreview(null);
                                setFormData(prev => ({ ...prev, logo_dark: null }));
                              }}
                            >
                              Remove Dark Logo
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-muted rounded-full p-6 mx-auto w-fit">
                            <School className="h-16 w-16 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Optional dark mode logo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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