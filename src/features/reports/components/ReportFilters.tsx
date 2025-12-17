// src/features/reports/components/ReportFilters.tsx
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select as SelectRoot } from "@/components/ui/select"; 
import { useReferenceData } from "@/features/settings/subjects/hooks/useReferenceData";

interface Filters {
    academic_year: string;
    term: number;
    class_room_id: number;
    department_id: number;
}

interface Props {
    onSubmit: (data: Filters) => void;
}

export const ReportFilters = ({ onSubmit }: Props) => {
    const { data, isLoading } = useReferenceData();

    // This runs once on mount — and ONLY once
    const [form, setForm] = useState<Partial<Filters>>({
        academic_year: "",
        term: 0,
        class_room_id: 0,
        department_id: 0,
    });

    useEffect(() => {
        if (!data) return;

        const currentYear = data.academic_years.find(y => y.is_current);
        const currentTerm = data.terms.find(t => t.is_current);

        // console.log("Auto-filling form with current year & term");
        // console.log("Current Year:", currentYear);
        console.log("Current Term:", currentTerm);

        setForm(prev => ({
            ...prev,
            academic_year: currentYear?.id || prev.academic_year || "",
            term: currentTerm?.id ?? prev.term ?? 0,
        }));
    }, [data]);

    // console.log("Render — form state:", form);
    // console.log("Render — data loaded:", !!data);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.academic_year || !form.class_room_id || !form.department_id) {
            alert("Please fill all fields");
            return;
        }
        onSubmit(form as Filters);
    };

    if (isLoading) {
        return <Card><CardContent className="p-8 text-center">Loading filters...</CardContent></Card>;
    }

    if (!data) {
        return <Card><CardContent className="p-8 text-center text-red-600">Failed to load reference data</CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Report Parameters</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Academic Year */}
                        <div className="space-y-2">
                            <Label>Academic Year</Label>
                            <Select
                                value={form.academic_year || ""}
                                onValueChange={(value) => {
                                    setForm(prev => ({
                                        ...prev,
                                        academic_year: value || prev.academic_year || "",
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select academic year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.academic_years.map(year => (
                                        <SelectItem key={year.id} value={year.id}>
                                            {year.name} {year.is_current && "← Current"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Term */}
                        <div className="space-y-2">
                            <Label>Term</Label>
                            <Select
                                value={form.term ? form.term.toString() : ""}
                                onValueChange={(value) => {
                                    const num = parseInt(value, 10);
                                    if (!isNaN(num)) {
                                        setForm(prev => ({ ...prev, term: num }));
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.terms.map(term => (
                                        <SelectItem key={term.id} value={term.id.toString()}>
                                            {term.name} {term.is_current && "← Current"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class */}
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <SelectRoot
                                value={form.class_room_id?.toString()}
                                onValueChange={(value) => setForm(prev => ({ ...prev, class_room_id: parseInt(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.classrooms.map(cls => (
                                        <SelectItem key={cls.id} value={cls.id.toString()}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <Label>Department / Option</Label>
                            <SelectRoot
                                value={form.department_id?.toString()}
                                onValueChange={(value) => setForm(prev => ({ ...prev, department_id: parseInt(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg">
                            Check Readiness
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};