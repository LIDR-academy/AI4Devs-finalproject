package com.hexagonal.meditation.generation.infrastructure.out.persistence;

import com.hexagonal .meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.entity.MeditationOutputEntity;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.mapper.MeditationOutputMapper;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.repository.JpaMeditationOutputRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostgresContentRepository Tests")
class PostgresContentRepositoryTest {
    
    @Mock
    private JpaMeditationOutputRepository jpaRepository;
    
    private MeditationOutputMapper mapper;
    private PostgresContentRepository repository;
    
    private Clock fixedClock;
    
    @BeforeEach
    void setUp() {
        mapper = new MeditationOutputMapper();
        repository = new PostgresContentRepository(jpaRepository, mapper);
        fixedClock = Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneOffset.UTC);
    }
    
    @Test
    @DisplayName("Should save generated meditation content")
    void shouldSaveMeditation() {
        UUID meditationId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String idempotencyKey = "test-key-123";
        NarrationScript script = new NarrationScript("Test meditation script.");
        
        GeneratedMeditationContent domain = GeneratedMeditationContent.createAudio(
            meditationId, compositionId, userId, idempotencyKey, script, fixedClock
        );
        
        MeditationOutputEntity entity = mapper.toEntity(domain);
        when(jpaRepository.save(any(MeditationOutputEntity.class))).thenReturn(entity);
        
        GeneratedMeditationContent result = repository.save(domain);
        
        assertThat(result.meditationId()).isEqualTo(meditationId);
        assertThat(result.status()).isEqualTo(GenerationStatus.PROCESSING);
        verify(jpaRepository, times(1)).save(any(MeditationOutputEntity.class));
    }
    
    @Test
    @DisplayName("Should find meditation by ID")
    void shouldFindById() {
        UUID meditationId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String idempotencyKey = "test-key-456";
        
        MeditationOutputEntity entity = new MeditationOutputEntity(
            meditationId, compositionId, userId, idempotencyKey, MediaType.VIDEO, 
            GenerationStatus.PROCESSING, "Test script", 5.0, fixedClock.instant()
        );
        entity.setBackgroundImageUrl("https://example.com/image.jpg");  // VIDEO requires background image
        
        when(jpaRepository.findById(meditationId)).thenReturn(Optional.of(entity));
        
        Optional<GeneratedMeditationContent> result = repository.findById(meditationId);
        
        assertThat(result).isPresent();
        assertThat(result.get().meditationId()).isEqualTo(meditationId);
        assertThat(result.get().mediaType()).isEqualTo(MediaType.VIDEO);
        verify(jpaRepository, times(1)).findById(meditationId);
    }
    
    @Test
    @DisplayName("Should return empty when meditation not found by ID")
    void shouldReturnEmptyWhenNotFoundById() {
        UUID meditationId = UUID.randomUUID();
        when(jpaRepository.findById(meditationId)).thenReturn(Optional.empty());
        
        Optional<GeneratedMeditationContent> result = repository.findById(meditationId);
        
        assertThat(result).isEmpty();
        verify(jpaRepository, times(1)).findById(meditationId);
    }
    
    @Test
    @DisplayName("Should find meditation by idempotency key")
    void shouldFindByIdempotencyKey() {
        UUID meditationId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String idempotencyKey = "unique-key-789";
        
        MeditationOutputEntity entity = new MeditationOutputEntity(
            meditationId, compositionId, userId, idempotencyKey, MediaType.AUDIO, 
            GenerationStatus.COMPLETED, "Completed script", 10.0, fixedClock.instant()
        );
        entity.setCompletedAt(fixedClock.instant());
        
        when(jpaRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(entity));
        
        Optional<GeneratedMeditationContent> result = repository.findByIdempotencyKey(idempotencyKey);
        
        assertThat(result).isPresent();
        assertThat(result.get().idempotencyKey()).isEqualTo(idempotencyKey);
        assertThat(result.get().status()).isEqualTo(GenerationStatus.COMPLETED);
        verify(jpaRepository, times(1)).findByIdempotencyKey(idempotencyKey);
    }
    
    @Test
    @DisplayName("Should return empty when meditation not found by idempotency key")
    void shouldReturnEmptyWhenNotFoundByIdempotencyKey() {
        String idempotencyKey = "nonexistent-key";
        when(jpaRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        
        Optional<GeneratedMeditationContent> result = repository.findByIdempotencyKey(idempotencyKey);
        
        assertThat(result).isEmpty();
        verify(jpaRepository, times(1)).findByIdempotencyKey(idempotencyKey);
    }
    
    @Test
    @DisplayName("Should delete meditation by ID")
    void shouldDeleteMeditation() {
        UUID meditationId = UUID.randomUUID();
        
        repository.delete(meditationId);
        
        verify(jpaRepository, times(1)).deleteById(meditationId);
    }
}
