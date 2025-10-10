---
trigger: always_on
---

Of course. Here are the essential rules in a concise format perfect for a `cursor.rules.md` file.

-----

## 1\. Project Setup & Tooling 🛠️

  * **Scaffolding:** Use **Vite** for all new projects: `npm create vite@latest my-app -- --template react-ts`.
  * **TypeScript:** Your `tsconfig.json` must have `"strict": true`. This is non-negotiable.
  * **Code Quality:** Enforce consistency with **ESLint** and **Prettier**.

-----

## 2\. Component Architecture 🏗️

  * **Style:** Use **functional components** with **Hooks** exclusively.

  * **Props:** Always type props. Never use `any`.

    ```typescript
    interface ComponentProps {
      title: string;
      id: number;
      onClick: () => void;
      isOptional?: boolean;
    }

    const MyComponent = ({ title, ... }: ComponentProps) => { /* ... */ };
    ```

  * **Structure:** Organize files by **feature**, not by type.

    ```
    /features
      /authentication
      /products
    /components // Only for truly generic, shared components (Button, Input)
    ```

  * **Naming:** Components are `PascalCase.tsx`. Hooks and functions are `camelCase.ts`.

-----

## 3\. State Management 🧠

  * **Local State:** Default to `useState`. Use `useReducer` for complex component-level state logic.
  * **Server State:** Use **TanStack Query** (React Query) for all API interactions. It handles caching, loading, and error states so you don't have to.
  * **Global UI State:** For global client-side state (e.g., theme, modal open/close), use a minimal state manager like **Zustand** or **Jotai**.

-----

## 4\. Styling ✨

  * **Methodology:** Use a scoped styling solution to avoid global namespace conflicts.
  * **Recommendation:** **Tailwind CSS** is the preferred utility-first choice. **CSS Modules** are a great, simple alternative for component-scoped CSS.

-----

## 5\. Data & Side Effects 📡

  * **Reusability:** Extract any reusable component logic (especially logic involving other hooks) into **custom hooks**.

  * **API Typing:** Define types for API payloads. Use **Zod** to validate runtime data and infer static types simultaneously.

    ```typescript
    import { z } from "zod";

    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      isAdmin: z.boolean().default(false),
    });

    type User = z.infer<typeof UserSchema>;

    // const user = UserSchema.parse(apiResponse);
    ```

-----

## 6\. Core Best Practices ✅

  * **Immutability:** Never mutate state or props directly.
  * **Lists:** Always provide a stable and unique `key` prop when rendering lists.
  * **TypeScript:** **Avoid `any`**. If a type is truly unknown, use `unknown` and perform type-checking.
  * **Testing:** Use **Vitest** and **React Testing Library**. Test user behavior, not implementation details.