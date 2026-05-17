package com.mtl.media.integration;

import com.mtl.media.config.MediaJwtDecoderConfigTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@Tag("integration")
@SpringBootTest
@Import(MediaJwtDecoderConfigTest.class)
@ActiveProfiles("test")
class MediaServiceApplicationIT {

  @Test
  void contextLoads() {}
}
