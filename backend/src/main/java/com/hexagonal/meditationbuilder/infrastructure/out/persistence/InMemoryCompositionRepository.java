package com.hexagonal.meditationbuilder.infrastructure.out.persistence;

import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.ports.out.CompositionRepositoryPort;
import org.springframework.stereotype.Repository;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public class InMemoryCompositionRepository implements CompositionRepositoryPort {
    private final Map<UUID, MeditationComposition> store = new HashMap<>();

    @Override
    public MeditationComposition save(MeditationComposition composition) {
        store.put(composition.id(), composition);
        return composition;
    }

    @Override
    public Optional<MeditationComposition> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return store.containsKey(id);
    }
}
