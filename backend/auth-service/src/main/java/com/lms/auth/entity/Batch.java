package com.lms.auth.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.List;

@Entity
@Table(name = "batches")
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference
    private Course course;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "batch_students",
        joinColumns = @JoinColumn(name = "batch_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<Student> students;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public List<Student> getStudents() { return students; }
    public void setStudents(List<Student> students) { this.students = students; }
}
