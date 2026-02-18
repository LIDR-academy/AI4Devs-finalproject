package com.hexagonal.playback.infrastructure.config;

import com.hexagonal.playback.application.service.GetPlaybackInfoService;
import com.hexagonal.playback.application.service.ListMeditationsService;
import com.hexagonal.playback.application.service.PlaybackValidator;
import com.hexagonal.playback.domain.ports.in.GetPlaybackInfoUseCase;
import com.hexagonal.playback.domain.ports.in.ListMeditationsUseCase;
import com.hexagonal.playback.domain.ports.out.MeditationRepositoryPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration for Playback BC beans.
 * 
 * Provides:
 * - Application use case implementations (services)
 * - Domain validators
 * - Clock is provided by global ClockConfig
 */
@Configuration
public class PlaybackConfig {

    /**
     * Provides the validator for playback business rules.
     * 
     * @return PlaybackValidator instance
     */
    @Bean
    public PlaybackValidator playbackValidator() {
        return new PlaybackValidator();
    }

    /**
     * Provides the use case for listing user meditations.
     * 
     * @param port the repository port for data access
     * @return ListMeditationsUseCase implementation
     */
    @Bean
    public ListMeditationsUseCase listMeditationsUseCase(MeditationRepositoryPort port) {
        return new ListMeditationsService(port);
    }

    /**
     * Provides the use case for getting playback information.
     * 
     * @param port the repository port for data access
     * @param validator the playback rules validator
     * @return GetPlaybackInfoUseCase implementation
     */
    @Bean
    public GetPlaybackInfoUseCase getPlaybackInfoUseCase(
        MeditationRepositoryPort port,
        PlaybackValidator validator
    ) {
        return new GetPlaybackInfoService(port, validator);
    }
}
