"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export default function CreateBatchPage() {
  const router = useRouter();
  const [batchName, setBatchName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [students, setStudents] = useState<string[]>([]);
  const [allStudents, setAllStudents] = useState<{id: string, name: string, email: string}[]>([]);
    // Fetch students from backend API
    useEffect(() => {
      async function fetchStudents() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/students`);
          if (!res.ok) throw new Error("Failed to fetch students");
          const data = await res.json();
          // Map API data to dropdown format
          const students = Array.isArray(data)
            ? data.map((s: any) => ({
                id: String(s.id),
                name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
                email: s.email,
              }))
            : [];
          setAllStudents(students);
        } catch (err) {
          setAllStudents([]);
        }
      }
      fetchStudents();
    }, []);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddStudent = () => {
    if (studentEmail && !students.includes(studentEmail)) {
      setStudents([...students, studentEmail]);
      setStudentEmail("");
    }
  };

  // Add selected students from dropdown
  const handleAddSelectedStudents = () => {
    const selectedEmails = allStudents
      .filter((s) => selectedStudentIds.includes(s.id))
      .map((s) => s.email)
      .filter((email) => !students.includes(email));
    setStudents([...students, ...selectedEmails]);
    setSelectedStudentIds([]);
    setSearchTerm("");
  };

  const handleCreateBatch = () => {
    // TODO: Implement batch creation logic (API call)
    alert(`Batch '${batchName}' for course '${courseName}' created with students: ${students.join(", ")}`);
    router.push("/admin/courses");
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Create Batch</h1>
        <p className="text-lg text-muted-foreground mt-2">Create a new batch and add students by email.</p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Batch Name"
              value={batchName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBatchName(e.target.value)}
            />
            <Input
              placeholder="Course Name"
              value={courseName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourseName(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Student Email"
                value={studentEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentEmail(e.target.value)}
              />
              <Button type="button" onClick={handleAddStudent}>
                Add Student
              </Button>
            </div>
            {/* Searchable multi-select dropdown for students */}
            <div className="mt-4">
              <label className="block mb-2 font-medium">Add Students from List:</label>
              <Input
                placeholder="Search students by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded p-2 max-h-40 overflow-y-auto">
                {allStudents
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((student) => (
                    <div key={student.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds([...selectedStudentIds, student.id]);
                          } else {
                            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                          }
                        }}
                      />
                      <span>{student.name} ({student.email})</span>
                    </div>
                  ))}
              </div>
              <Button
                type="button"
                className="mt-2"
                onClick={handleAddSelectedStudents}
                disabled={selectedStudentIds.length === 0}
              >
                Add Selected Students
              </Button>
            </div>
            <div>
              <strong>Students in Batch:</strong>
              <ul className="list-disc ml-6">
                  {students.map((email: string) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
            <Button type="button" onClick={handleCreateBatch}>
              Create Batch
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
