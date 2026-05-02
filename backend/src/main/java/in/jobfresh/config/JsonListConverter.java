package in.jobfresh.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.jobfresh.model.JobContent;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

/**
 * Converts List<X> ↔ JSON string for MySQL JSON columns.
 *
 * One converter per concrete List<T> (JPA limitation — generics erased at runtime).
 * Apply with @Convert(converter = SelectionRoundListConverter.class) on the field.
 */
public class JsonListConverter {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ── Reusable string list (skills, responsibilities, documents) ──────────

    @Slf4j
    @Converter
    public static class StringListConverter implements AttributeConverter<List<String>, String> {
        @Override
        public String convertToDatabaseColumn(List<String> list) {
            if (list == null || list.isEmpty()) return null;
            try { return MAPPER.writeValueAsString(list); }
            catch (JsonProcessingException e) {
                log.error("Failed to serialize string list", e);
                return null;
            }
        }
        @Override
        public List<String> convertToEntityAttribute(String json) {
            if (json == null || json.isBlank()) return new ArrayList<>();
            try { return MAPPER.readValue(json, new TypeReference<List<String>>() {}); }
            catch (Exception e) {
                log.error("Failed to deserialize string list: {}", json, e);
                return new ArrayList<>();
            }
        }
    }

    // ── Selection rounds ─────────────────────────────────────────────────────

    @Slf4j
    @Converter
    public static class SelectionRoundListConverter
            implements AttributeConverter<List<JobContent.SelectionRound>, String> {
        @Override
        public String convertToDatabaseColumn(List<JobContent.SelectionRound> list) {
            if (list == null || list.isEmpty()) return null;
            try { return MAPPER.writeValueAsString(list); }
            catch (JsonProcessingException e) {
                log.error("Failed to serialize selection rounds", e);
                return null;
            }
        }
        @Override
        public List<JobContent.SelectionRound> convertToEntityAttribute(String json) {
            if (json == null || json.isBlank()) return new ArrayList<>();
            try { return MAPPER.readValue(json, new TypeReference<List<JobContent.SelectionRound>>() {}); }
            catch (Exception e) {
                log.error("Failed to deserialize selection rounds: {}", json, e);
                return new ArrayList<>();
            }
        }
    }

    // ── FAQs ─────────────────────────────────────────────────────────────────

    @Slf4j
    @Converter
    public static class FaqListConverter
            implements AttributeConverter<List<JobContent.Faq>, String> {
        @Override
        public String convertToDatabaseColumn(List<JobContent.Faq> list) {
            if (list == null || list.isEmpty()) return null;
            try { return MAPPER.writeValueAsString(list); }
            catch (JsonProcessingException e) {
                log.error("Failed to serialize FAQs", e);
                return null;
            }
        }
        @Override
        public List<JobContent.Faq> convertToEntityAttribute(String json) {
            if (json == null || json.isBlank()) return new ArrayList<>();
            try { return MAPPER.readValue(json, new TypeReference<List<JobContent.Faq>>() {}); }
            catch (Exception e) {
                log.error("Failed to deserialize FAQs: {}", json, e);
                return new ArrayList<>();
            }
        }
    }

    // ── Important links ──────────────────────────────────────────────────────

    @Slf4j
    @Converter
    public static class ImportantLinkListConverter
            implements AttributeConverter<List<JobContent.ImportantLink>, String> {
        @Override
        public String convertToDatabaseColumn(List<JobContent.ImportantLink> list) {
            if (list == null || list.isEmpty()) return null;
            try { return MAPPER.writeValueAsString(list); }
            catch (JsonProcessingException e) {
                log.error("Failed to serialize important links", e);
                return null;
            }
        }
        @Override
        public List<JobContent.ImportantLink> convertToEntityAttribute(String json) {
            if (json == null || json.isBlank()) return new ArrayList<>();
            try { return MAPPER.readValue(json, new TypeReference<List<JobContent.ImportantLink>>() {}); }
            catch (Exception e) {
                log.error("Failed to deserialize important links: {}", json, e);
                return new ArrayList<>();
            }
        }
    }
}
