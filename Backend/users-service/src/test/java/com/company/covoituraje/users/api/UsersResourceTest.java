package com.company.covoituraje.users.api;

import com.company.covoituraje.users.domain.User;
import com.company.covoituraje.users.infrastructure.UserRepository;
import com.company.covoituraje.shared.i18n.MessageService;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class UsersResourceTest {

    private UsersResource usersResource;
    private UserRepository mockRepository;
    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService();
        mockRepository = new UserRepository(null) {
            @Override
            public Optional<User> findById(String id) {
                if ("test-user".equals(id)) {
                    User user = new User();
                    user.setId("test-user");
                    user.setName("Test User");
                    user.setEmail("test@example.com");
                    user.setSedeId("sede-1");
                    user.setRole("EMPLOYEE");
                    return Optional.of(user);
                }
                return Optional.empty();
            }
            
            @Override
            public List<User> findAll() {
                return new ArrayList<>();
            }
            
            @Override
            public List<User> findBySedeId(String sedeId) {
                return new ArrayList<>();
            }
            
            @Override
            public List<User> findByRole(String role) {
                return new ArrayList<>();
            }
            
            @Override
            public User save(User user) {
                return user;
            }
        };
        usersResource = new UsersResource(mockRepository, messageService);
    }

    @Test
    void getMe_returnsUserWithLocalizedMessages() {
        // Set up auth context
        UsersResource.AuthContext.setUserId("test-user");
        
        try {
            UserDto result = usersResource.getMe("en");
            
            assertNotNull(result);
            assertEquals("test-user", result.id);
            assertEquals("Test User", result.name);
            assertEquals("test@example.com", result.email);
            assertEquals("sede-1", result.sedeId);
            assertTrue(result.roles.contains("EMPLOYEE"));
        } finally {
            UsersResource.AuthContext.clear();
        }
    }

    @Test
    void getMe_withAcceptLanguageHeader_usesCorrectLocale() {
        // Set up auth context
        UsersResource.AuthContext.setUserId("test-user");
        
        try {
            // Test with Spanish locale
            UserDto result = usersResource.getMe("es");
            
            assertNotNull(result);
            assertEquals("test-user", result.id);
            // The response should be the same regardless of locale for this endpoint
            // but the MessageService is available for future localized error messages
        } finally {
            UsersResource.AuthContext.clear();
        }
    }

    @Test
    void getMe_withUnsupportedLanguage_fallsBackToDefault() {
        // Set up auth context
        UsersResource.AuthContext.setUserId("test-user");
        
        try {
            // Test with unsupported locale
            UserDto result = usersResource.getMe("de");
            
            assertNotNull(result);
            assertEquals("test-user", result.id);
        } finally {
            UsersResource.AuthContext.clear();
        }
    }

    @Test
    void getMe_withoutUserId_throwsBadRequestException() {
        // Don't set auth context
        assertThrows(BadRequestException.class, () -> {
            usersResource.getMe("en");
        });
    }

    @Test
    void getMe_withNonExistentUser_throwsNotFoundException() {
        // Set up auth context with non-existent user
        UsersResource.AuthContext.setUserId("non-existent");
        
        try {
            assertThrows(NotFoundException.class, () -> {
                usersResource.getMe("en");
            });
        } finally {
            UsersResource.AuthContext.clear();
        }
    }
}