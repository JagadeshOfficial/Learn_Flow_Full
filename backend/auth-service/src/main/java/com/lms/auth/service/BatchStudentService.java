package com.lms.auth.service;

import com.lms.auth.entity.BatchStudent;
import com.lms.auth.entity.Student;
import com.lms.auth.repository.BatchStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchStudentService {
    @Autowired
    private BatchStudentRepository batchStudentRepository;

    public List<Student> getStudentsByBatchId(Long batchId) {
        List<BatchStudent> batchStudents = batchStudentRepository.findByBatchId(batchId);
        return batchStudents.stream().map(BatchStudent::getStudent).collect(Collectors.toList());
    }
}
