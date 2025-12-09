package com.lms.auth.repository;

import com.lms.auth.entity.BatchStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BatchStudentRepository extends JpaRepository<BatchStudent, Long> {
    List<BatchStudent> findByBatchId(Long batchId);
}
