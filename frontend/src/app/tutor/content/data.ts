

export interface Batch {
  id: string;
  name: string;
  students?: Student[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  batches: Batch[];
}

export interface Student {
    id: string;
    name: string;
}

export const tutorCourses: Course[] = [
  {
    id: "C001",
    title: "MERN Stack Mastery",
    description: "Build full-stack applications with MongoDB, Express, React and Node.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a5f6d0c7e3e9f0c6f3a3d6b4f0a9d2a",
    batches: [
        { id: "C001-B1", name: "Batch 1 (Morning)" },
        { id: "C001-B2", name: "Batch 2 (Evening)" },
        { id: "C001-B3", name: "Batch 3 (Weekend)" },
    ]
  },
  {
    id: "C002",
    title: "Python for Data Analytics",
    description: "Analyze data and build dashboards using pandas, NumPy and visualization libraries.",
    image: "https://images.unsplash.com/photo-1526378724516-7ee1a3b8f8ab?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=3b4e6b7f2c8d6a1b2c3d4e5f6a7b8c9d",
    batches: [
        { id: "C002-B1", name: "Batch A" },
        { id: "C002-B2", name: "Batch B" },
    ]
  },
];

export const tutorStudents: Student[] = [
    {
        id: "S001",
        name: "Alex Johnson",
    },
    {
        id: "S002",
        name: "Maria Garcia",
    },
    {
        id: "S003",
        name: "Sam Chen",
    },
    {
        id: "S004",
        name: "Emily White",
    }
]
