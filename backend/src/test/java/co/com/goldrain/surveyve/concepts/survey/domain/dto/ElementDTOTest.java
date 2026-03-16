package co.com.goldrain.surveyve.concepts.survey.domain.dto;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ElementDTOTest {
    @Test
    void testTypeTextAndInputTypeColor() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.COLOR);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("color", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeDate() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.DATE);
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("date", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeDateWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.DATE);
        element.setMin("01/01/2023");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("date", element.getInputType());
        assertEquals("01/01/2023", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeDateWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.DATE);
        element.setMin("01/01/2023");
        element.setMax("12/31/2023");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("date", element.getInputType());
        assertEquals("01/01/2023", element.getMin());
        assertEquals("12/31/2023", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeDatetimeLocal() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.DATETIME_LOCAL);
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("datetime-local", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeDatetimeLocalWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.DATETIME_LOCAL);
        element.setMin("2023-01-01T00:00");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("datetime-local", element.getInputType());
        assertEquals("2023-01-01T00:00", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeDatetimeLocalWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.DATETIME_LOCAL);
        element.setMin("2023-01-01T00:00");
        element.setMax("2023-12-31T23:59");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("datetime-local", element.getInputType());
        assertEquals("2023-01-01T00:00", element.getMin());
        assertEquals("2023-12-31T23:59", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeEmail() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.EMAIL);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("email", element.getInputType());
        assertEquals("Enter value", element.getPlaceholder());


        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeEmailWithPlaceholder() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.EMAIL);
        element.setPlaceholder("Enter your email");
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y placeholder tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("email", element.getInputType());
        assertEquals("Enter your email", element.getPlaceholder());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeMonth() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.MONTH);
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("month", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeMonthWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.MONTH);
        element.setMin("2023-01");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("month", element.getInputType());
        assertEquals("2023-01", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeMonthWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.MONTH);
        element.setMin("2023-01");
        element.setMax("2023-12");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("month", element.getInputType());
        assertEquals("2023-01", element.getMin());
        assertEquals("2023-12", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeNumber() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.NUMBER);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("number", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeNumberWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.NUMBER);
        element.setMin("1");
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("number", element.getInputType());
        assertEquals("1", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeNumberWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.NUMBER);
        element.setMin("1");
        element.setMax("10");
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("number", element.getInputType());
        assertEquals("1", element.getMin());
        assertEquals("10", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeNumberWithMinMaxAndStep() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.NUMBER);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min, max y step tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("number", element.getInputType());
        assertEquals("1", element.getMin());
        assertEquals("10", element.getMax());
        assertEquals(1.0, element.getStep());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypePassword() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.PASSWORD);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("password", element.getInputType());
        assertEquals("Enter value", element.getPlaceholder());


        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypePasswordWithPlaceholder() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.PASSWORD);
        element.setPlaceholder("Enter your password");
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y placeholder tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("password", element.getInputType());
        assertEquals("Enter your password", element.getPlaceholder());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeRange() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.RANGE);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("range", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeRangeWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.RANGE);
        element.setMin("1");
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("range", element.getInputType());
        assertEquals("1", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeRangeWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.RANGE);
        element.setMin("1");
        element.setMax("10");
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("range", element.getInputType());
        assertEquals("1", element.getMin());
        assertEquals("10", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeRangeWithMinMaxAndStep() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.RANGE);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min, max y step tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("range", element.getInputType());
        assertEquals("1", element.getMin());
        assertEquals("10", element.getMax());
        assertEquals(1.0, element.getStep());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeTel() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TEL);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("tel", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeTelWithPlaceholder() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TEL);
        element.setPlaceholder("Enter your phone number");
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y placeholder tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("tel", element.getInputType());
        assertEquals("Enter your phone number", element.getPlaceholder());

        // Validar que las dem��s propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeTime() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TIME);
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("time", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeTimeWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TIME);
        element.setMin("08:00");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("time", element.getInputType());
        assertEquals("08:00", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeTimeWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TIME);
        element.setMin("08:00");
        element.setMax("18:00");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("time", element.getInputType());
        assertEquals("08:00", element.getMin());
        assertEquals("18:00", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeUrl() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.URL);
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("url", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeUrlWithPlaceholder() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.URL);
        element.setPlaceholder("Enter your URL");
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y placeholder tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("url", element.getInputType());
        assertEquals("Enter your URL", element.getPlaceholder());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeWeek() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.WEEK);
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete e inputType tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("week", element.getInputType());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeWeekWithMin() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.WEEK);
        element.setMin("2023-W01");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType y min tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("week", element.getInputType());
        assertEquals("2023-W01", element.getMin());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeTextAndInputTypeWeekWithMinAndMax() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.TEXT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.WEEK);
        element.setMin("2023-W01");
        element.setMax("2023-W52");
        element.setStep(1.0);
        element.setPlaceholder("Enter value");
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, autocomplete, inputType, min y max tienen valor
        assertEquals(id, element.getId());
        assertEquals("text", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("on", element.getAutocomplete());
        assertEquals("week", element.getInputType());
        assertEquals("2023-W01", element.getMin());
        assertEquals("2023-W52", element.getMax());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getStep());
        assertNull(element.getPlaceholder());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeComment() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.COMMENT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TEXT);
        element.setPlaceholder("Enter your comment");
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly y placeholder tienen valor
        assertEquals(id, element.getId());
        assertEquals("comment", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("Enter your comment", element.getPlaceholder());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeCommentWithPlaceholder() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.COMMENT);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setAutocomplete("on");
        element.setInputType(ElementDTO.TEXT);
        element.setPlaceholder("Enter your comment");
        element.setMin("1");
        element.setMax("10");
        element.setStep(1.0);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly y placeholder tienen valor
        assertEquals(id, element.getId());
        assertEquals("comment", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals("Enter your comment", element.getPlaceholder());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeRating() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.RATING);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, rateCount, rateMax, rateType y rateValues tienen valor
        assertEquals(id, element.getId());
        assertEquals("rating", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(5, element.getRateCount());
        assertEquals(10, element.getRateMax());
        assertEquals("stars", element.getRateType());
        assertEquals(List.of(1, 2, 3, 4, 5), element.getRateValues());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeRatingWithRateTypeNull() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.RATING);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType(null);
        element.setRateValues(List.of(1, 2, 3, 4, 5));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, rateCount, rateMax, rateType y rateValues tienen valor
        assertEquals(id, element.getId());
        assertEquals("rating", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(5, element.getRateCount());
        assertEquals(10, element.getRateMax());
        assertNull(element.getRateType());
        assertEquals(List.of(1, 2, 3, 4, 5), element.getRateValues());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeRatingWithRateTypeStars() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.RATING);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("stars");
        element.setRateValues(List.of(1, 2, 3, 4, 5));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, rateCount, rateMax, rateType y rateValues tienen valor
        assertEquals(id, element.getId());
        assertEquals("rating", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(5, element.getRateCount());
        assertEquals(10, element.getRateMax());
        assertEquals("stars", element.getRateType());
        assertEquals(List.of(1, 2, 3, 4, 5), element.getRateValues());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeRatingWithRateTypeSmileys() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.RATING);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setRateCount(5);
        element.setRateMax(10);
        element.setRateType("smileys");
        element.setRateValues(List.of(1, 2, 3, 4, 5));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, rateCount, rateMax, rateType y rateValues tienen valor
        assertEquals(id, element.getId());
        assertEquals("rating", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(5, element.getRateCount());
        assertEquals(10, element.getRateMax());
        assertEquals("smileys", element.getRateType());
        assertEquals(List.of(1, 2, 3, 4, 5), element.getRateValues());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeRatingWithRateValuesAsMap() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.RATING);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);

        // Crear una lista de mapas para la propiedad rateValues
        List<Map<String, String>> rateValues = List.of(
                Map.of("value", "1", "text", "Poor"),
                Map.of("value", "2", "text", "Fair"),
                Map.of("value", "3", "text", "Good"),
                Map.of("value", "4", "text", "Very Good"),
                Map.of("value", "5", "text", "Excellent")
        );
        element.setRateValues(rateValues);

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly, rateCount, rateMax, rateType y rateValues tienen valor
        assertEquals(id, element.getId());
        assertEquals("rating", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(rateValues, element.getRateValues());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getChoices());
    }

    @Test
    void testTypeDropdown() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.DROPDOWN);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);
        element.setChoices(List.of("Option 1", "Option 2"));

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly y choices tienen valor
        assertEquals(id, element.getId());
        assertEquals("dropdown", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(List.of("Option 1", "Option 2"), element.getChoices());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
    }

    @Test
    void testTypeDropdownWithChoicesAsMap() {
        // Crear un objeto ElementDTO con todas las propiedades llenas
        ElementDTO element = new ElementDTO();
        UUID id = UUID.randomUUID();
        element.setId(id);
        element.setType(ElementDTO.DROPDOWN);
        element.setName("name");
        element.setTitle("title");
        element.setRequired(true);
        element.setVisible(true);
        element.setReadOnly(false);

        // Crear una lista de mapas para la propiedad choices
        List<Map<String, String>> choices = List.of(
                Map.of("value", "1", "text", "Option 1"),
                Map.of("value", "2", "text", "Option 2")
        );
        element.setChoices(choices);

        // Ejecutar el método fix
        element.fix();

        // Validar que solo las propiedades id, type, name, title, isRequired, visible, readOnly y choices tienen valor
        assertEquals(id, element.getId());
        assertEquals("dropdown", element.getType());
        assertEquals("name", element.getName());
        assertEquals("title", element.getTitle());
        assertTrue(element.isRequired());
        assertTrue(element.isVisible());
        assertFalse(element.isReadOnly());
        assertEquals(choices, element.getChoices());

        // Validar que las demás propiedades tienen valores false, null o 0 según su tipo
        assertNull(element.getAutocomplete());
        assertNull(element.getInputType());
        assertNull(element.getPlaceholder());
        assertNull(element.getMin());
        assertNull(element.getMax());
        assertNull(element.getStep());
        assertNull(element.getRateCount());
        assertNull(element.getRateMax());
        assertNull(element.getRateType());
        assertNull(element.getRateValues());
    }
}