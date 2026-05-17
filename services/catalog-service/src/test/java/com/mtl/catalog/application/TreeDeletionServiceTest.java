package com.mtl.catalog.application;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.infrastructure.client.media.MediaTreePhotosClient;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class TreeDeletionServiceTest {

  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @Mock private TreeDeleteService treeDeleteService;
  @Mock private MediaTreePhotosClient mediaTreePhotosClient;
  @InjectMocks private TreeDeletionService treeDeletionService;

  @Test
  void deleteTree_invocaMediaAntesDeBorradoSql() {
    UsuarioApp actor = usuario(5L);
    TreeDeleteAuthorization auth = new TreeDeleteAuthorization(42L, 10L, 28L);
    Jwt jwt = collaboratorJwt();

    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class))).thenReturn(actor);
    when(treeDeleteService.authorize(42L, 5L, false)).thenReturn(auth);

    treeDeletionService.deleteTree(42L, jwt);

    InOrder order = inOrder(treeDeleteService, mediaTreePhotosClient, treeDeleteService);
    order.verify(treeDeleteService).authorize(42L, 5L, false);
    order.verify(mediaTreePhotosClient).deleteAllPhotosForTree(42L, jwt);
    order.verify(treeDeleteService).commitPhysicalDelete(auth, 5L);
  }

  private static UsuarioApp usuario(long id) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    return u;
  }

  private static Jwt collaboratorJwt() {
    return Jwt.withTokenValue("t")
        .header("alg", "none")
        .subject("kc-sub")
        .claim("email", "u@example.invalid")
        .claim("realm_access", Map.of("roles", java.util.List.of("COLABORADOR")))
        .build();
  }
}
