package com.lms.auth.controller;

import com.lms.auth.entity.Student;
import com.lms.auth.service.BatchStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tutor/courses/{courseId}/batches/{batchId}/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TutorBatchStudentController {
    @Autowired
    private BatchStudentService batchStudentService;

    @GetMapping
    public ResponseEntity<List<Student>> getStudentsInBatch(@PathVariable Long courseId, @PathVariable Long batchId) {
        List<Student> students = batchStudentService.getStudentsByBatchId(batchId);
        return ResponseEntity.ok(students);
    }
}
