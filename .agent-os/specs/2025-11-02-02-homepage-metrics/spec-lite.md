# Spec Summary (Lite)

Replace HomePage mock metrics with real-time data from new backend endpoints. Create a dedicated `/api/v1/metrics` router with three read-only endpoints: templates summary (unique templates + total versions), comparisons count, and monthly activity count. Frontend will consume these endpoints to display accurate dashboard statistics with proper loading and error states.
