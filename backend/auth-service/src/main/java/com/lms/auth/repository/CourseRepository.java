package com.lms.auth.repository;

import com.lms.auth.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CourseRepository extends JpaRepository<Course, Long> {
	// Removed custom query to avoid MultipleBagFetchException
}
