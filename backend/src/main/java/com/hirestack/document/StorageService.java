package com.hirestack.document;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {
    String storeFile(MultipartFile file, String subDirectory) throws IOException;
    Resource loadFileAsResource(String storagePath) throws IOException;
    void deleteFile(String storagePath) throws IOException;
    String getStorageType();
}

