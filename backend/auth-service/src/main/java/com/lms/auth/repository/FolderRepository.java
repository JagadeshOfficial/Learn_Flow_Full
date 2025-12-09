package com.lms.auth.repository;

import com.lms.auth.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByBatchId(Long batchId);
    List<Folder> findByParentId(Long parentId);
}
