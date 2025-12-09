import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const batches = [
  {
    id: "B001",
    name: "Batch 1",
    course: "React Basics",
    students: ["student1@email.com", "student2@email.com"],
  },
  {
    id: "B002",
    name: "Batch 2",
    course: "Node.js Advanced",
    students: ["student3@email.com"],
  },
];

export default function ManageCoursesPage() {
  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Courses</h1>
          <p className="text-lg text-muted-foreground mt-2">View and manage batches for each course.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/create-batch">Create Batch</Link>
        </Button>
      </header>
      <main>
        {batches.length === 0 ? (
          <p className="text-muted-foreground">No batches found.</p>
        ) : (
          batches.map((batch) => (
            <Card key={batch.id} className="mb-4">
              <CardHeader>
                <CardTitle>{batch.name} - {batch.course}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <strong>Students:</strong>
                  <ul className="list-disc ml-6">
                    {batch.students.map((email) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
