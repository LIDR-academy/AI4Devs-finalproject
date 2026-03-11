/**
 * Custom Hooks - Barrel Export
 *
 * Centralized exports for all custom React hooks.
 * Existing hooks are preserved, new template hooks are added.
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

// Existing hooks
export { useAuth } from './useAuth';
export {
    useAnalyzePageState,
    useDragAndDrop,
    useErrorState,
    useFileSelection,
    useFocusManagement,
    useLoadingState,
    usePDFAnalysis,
    useResponsiveBreakpoints,
    useTableSorting
} from './usePDFAnalysis';
export { useTheme } from './useTheme';

// New template management hooks
export { useTemplateFields } from './useTemplateFields';
export { useTemplates } from './useTemplates';
export { useTemplateVersion } from './useTemplateVersion';
export { useTemplateVersions } from './useTemplateVersions';

// Type exports for new hooks
export type { UseTemplateFieldsReturn } from './useTemplateFields';
export type { UseTemplatesReturn } from './useTemplates';
export type { UseTemplateVersionReturn } from './useTemplateVersion';
export type { UseTemplateVersionsReturn } from './useTemplateVersions';

