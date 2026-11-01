package com.hirestack.document;

import com.hirestack.common.BadRequestException;
import com.hirestack.common.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageService implements StorageService {

    @Value("${app.storage.local-dir:./uploads}")
    private String baseUploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(baseUploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize upload storage location", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "document"
        );

        if (originalFilename.contains("..")) {
            throw new BadRequestException("Cannot store file with relative path outside directory: " + originalFilename);
        }

        Path targetDir = this.rootLocation.resolve(subDirectory != null ? subDirectory : "");
        Files.createDirectories(targetDir);

        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;
        Path targetLocation = targetDir.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return this.rootLocation.relativize(targetLocation).toString().replace('\\', '/');
    }

    @Override
    public Resource loadFileAsResource(String storagePath) {
        try {
            Path filePath = this.rootLocation.resolve(storagePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found at storage path: " + storagePath);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found at storage path: " + storagePath);
        }
    }

    @Override
    public void deleteFile(String storagePath) throws IOException {
        Path filePath = this.rootLocation.resolve(storagePath).normalize();
        Files.deleteIfExists(filePath);
    }

    @Override
    public String getStorageType() {
        return "LOCAL";
    }
}

