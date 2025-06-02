Analyze project, load it in your context, and tell me what it is about.
-----
Simplify this architecture from the readme, make it simple, use Vercel for the frontend, Supabase for the database and just a simple backend API. Remove all the complex stuff and make it simple and modern.
-----
Initialize memory bank.
-----
Delete nginx and workers related folders and documentation.
-----
I still see mobile related things in readme, remove it
-----
let's start with backend. Analyze 'zenturno/backend/docker-compose.yml' (see below for file content) and remove unnecessary containers
-----
let's configure supabase for local development
-----
remove everything related to supabase, documentation, code and everything. Do not forget to add my prompts in file as indicating in @[/.windsurf/rules/02-prompt.md] rule. Also do not mention migartion from supabase, as we are in early stage of development and we did not use supabase yet, it was just configured, just replace all supabase to postgres and prisma.
-----
analyze and always use rules in @[.windsurf/rules], you are forgetting to add my prompts
-----
after running @[zenturno/backend/verify-setup.sh] I got error in terminal:

Error: P1000: Authentication failed against database server, the provided database credentials for `postgres` are not valid.

Do not forget to update @[prompts/prompts.md] 
-----
database is running without problems in docker and I can connect it using dbeaver, but in terminal after running @[zenturno/backend/verify-setup.sh] I got again this error:
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "zenturno", schema "public" at "localhost:5432"
Error: P1000: Authentication failed against database server, the provided database credentials for `postgres` are not valid.

Do we really need this script?
-----
Continue
-----
skip @[zenturno/backend/verify-setup.sh] and delete it, also delete @[zenturno/backend/backup-restore.sh] and @[zenturno/backend/setup-prisma.sh] 
-----
now let's change everything related to database in english, rename table and field names and use english for them
-----
I see that we have node_modules for the whole project. I think that we need separate modules for backend and frontend. For now, ignore frontend and only work on backend.
-----
in @docs create for me postman collection json to be able to import in postman and test endpoints
-----
I also need a Postman environment for local development.
-----

I see spanish texts in responses, for example `Formato de token inválido`. Look for any spanish text, comment, string, function name in code and change it to english
-----

I checked database using dbeaver and I still see tables with spanish names, change them to english, run docker compose
-----

I want you to act as a Senior full stack Typescript developer.
Your task is to develop a comprehensive suite of unit tests for @zenturno/backend . 
Follow these guidelines for an effective testing process:

1. **Understand the Codebase**: Analyze the TypeScript code thoroughly, step by step. Identify the possible ambiguity or missing information such as constants, type definitions, conditions, external APIs, etc and provide steps, and questions and seek clarification for better code understanding. Only proceed to the next step once you have analyzed the codebase fully.

2. **Testing framework**: For this task, use an **abstract** testing framework instead of known frameworks such as chai, jest, etc., remembering that the principles of unit testing apply regardless of the specific tools.

3. **Design Small, Focused Tests**: Each unit test should focus on one functionality, enhancing readability and ease of debugging. Ensure each test is isolated and does not depend on others. Simulate the behavior of external dependencies using mock objects to increase the reliability and speed of your tests.

4. **Structure and Name Your Tests Well**: Your tests should follow a clear structure and use descriptive names to make their purpose clear. Follow the provided below test structure:

```typescript
// import necessary methods from an abstract testing framework
import { describe, expect, it, beforeAll, beforeEach, afterAll } from './setup.js';

describe('<NAME_OF_MODULE_TO_TEST>', () => {
  // Define top-level test variables here

  beforeAll(async () => {
    // One-time initialization logic _if required_
  });

  beforeEach(async () => {
    // Logic that must be started before every test _if required_
  });
  
  afterAll(async () => {
    // Logic that must be started after all tests _if required_
  });

  describe('#<METHOD_NAME>', () => {
    // Define method-level variable here
    
    // Use method-lavel beforeAll, beforeEach or afterAll _if required_
    
    it('<TEST_CASE>', async () => {
      // Test case code

      // to assert definitions of variables use:
      // expect(<VARIABLE>).toBeDefined();

      // to assert equality use:
      // expect(<TEST_RESULT>).toEqual(<EXPECTED_VALUE>);
      // expect(<TEST_RESULT>).toStrictEqual(<EXPECTED_VALUE>);

      // for promises use async assertion:
      // await expect(<ASYNC_METHOD>).rejects.toThrow(<ERROR_MESSAGE>);
      // await expect(<ASYNC_METHOD>).resolves.toEqual(<EXPECTED_VALUE>);
    });
  });
});
```

Your additional guidelines:

1. **Implement the AAA Pattern**: Implement the Arrange-Act-Assert (AAA) paradigm in each test, establishing necessary preconditions and inputs (Arrange), executing the object or method under test (Act), and asserting the results against the expected outcomes (Assert).

2. **Test the Happy Path and Failure Modes**: Your tests should not only confirm that the code works under expected conditions (the 'happy path') but also how it behaves in failure modes.

3. **Testing Edge Cases**: Go beyond testing the expected use cases and ensure edge cases are also tested to catch potential bugs that might not be apparent in regular use.

4. **Avoid Logic in Tests**: Strive for simplicity in your tests, steering clear of logic such as loops and conditionals, as these can signal excessive test complexity.

5. **Leverage TypeScript's Type System**: Leverage static typing to catch potential bugs before they occur, potentially reducing the number of tests needed.

6. **Handle Asynchronous Code Effectively**: If your test cases involve promises and asynchronous operations, ensure they are handled correctly.

7. **Write Complete Test Cases**: Avoid writing test cases as mere examples or code skeletons. You have to write a complete set of tests. They should effectively validate the functionality under test. 

Your ultimate objective is to create a robust, complete test suite for the provided TypeScript code.
-----

always use jest for testing. Remove unnecessary files created for testing before now.
-----
great, now let's add tests for @AppointmentRepository.ts 
-----
continue implementing test for @zenturno/backend/src/infra/repositories 
-----
create tests for @ProfessionalRepository.ts similar to other tests in @zenturno/backend/test/infra/repositories/prisma 
-----
great, now let's move on @/zenturno/backend/src/infra/http/controllers and write unit tests for them
-----
> You are now an expert backend architect and software engineer. Our current prject that lacks a proper architecture. I want you to guide and implement a **refactor** using **Domain-Driven Design (DDD)** and **Hexagonal Architecture (Ports and Adapters)**.
>
> ## Goal:
>
> Migrate the project to follow proper software architecture principles with clear separation of concerns:
>
> * Use **DDD**: Define core **domains**, **entities**, **value objects**, **aggregates**, **repositories**, **services**, and **use cases (application layer)**.
> * Use **Hexagonal Architecture**: External layers (web, database, etc.) should communicate through **ports (interfaces)** and **adapters (implementations)**.
>
> ## Instructions:
>
> 1. Begin **step-by-step**, **feature-by-feature** (choose a small feature like "User Registration").
> 2. For each step:
>
>    * Explain the **goal** of the step.
>    * Create or refactor code files into the correct **DDD + Hexagonal** structure:
>
>      * `/src/domain`
>      * `/src/application`
>      * `/src/infrastructure` (adapters like DB, API, etc.)
>      * `/src/interfaces` (e.g. REST controllers, CLI)
>    * Use proper **TypeScript** types if possible (or JS + JSDoc if TS is not available).
>    * Add comments to explain **why** certain choices are made.
> 3. Maintain **testability**: structure code so each layer can be unit-tested independently.
> 4. Use best practices for error handling, dependency injection, and clean code.
>
> ## Constraints:
>
> * Avoid monolithic file structure.
> * Use dependency inversion for services (inject repositories via interfaces).
> * Avoid putting logic in the controllers or database layer.
>
> ## First Task:
>
> Start by analyzing the current "User Registration" feature (or mock one if not available). Implement it using DDD + Hexagonal approach. Provide code for:
>
> * Entity and value objects
> * Domain service (if needed)
> * Use case (application service)
> * Repository interface
> * In-memory repository implementation
> * REST API controller adapter

-----

> You are an expert full-stack architect and Next.js developer. I have an existing project with a **separate frontend and backend** (e.g., frontend built with React, backend built with Express.js or similar). I want to **migrate everything into a single codebase** using **Next.js (App Router)** to enable full-stack development.
>
> ## Goals:
>
> 1. Migrate all frontend and backend functionality into a **monorepo** powered by **Next.js**.
> 2. Use **Next.js App Router** (based in `/app`) with server actions and route handlers for backend logic.
> 3. Use **Supabase** for:
>
>    * Authentication (sign in, sign up, session handling)
>    * Database (PostgreSQL via Supabase client)
> 4. Eliminate the need for a separate Express.js server.
>
> ## Instructions:
>
> Proceed **step-by-step** and **feature-by-feature**. For each step:
>
> 1. Explain the purpose and give a high-level migration plan.
> 2. Migrate a specific feature (e.g., "User Login", "User Profile") by:
>
>    * Creating appropriate **pages** or **server actions** under `/app`
>    * Creating **API route handlers** under `/app/api` if needed
>    * Replacing Express endpoints with **Next.js server functions**
>    * Integrating Supabase SDK (use `@supabase/supabase-js`) for auth and DB operations
> 3. Implement proper folder structure using:
>
>    * `/app` for pages, layouts, server components
>    * `/lib` for reusable server/client logic
>    * `/db` or `/supabase` for Supabase client and typed queries
>    * `/components` for UI components
> 4. Make sure **auth state** is handled via `@supabase/auth-helpers-nextjs` or cookies
> 5. Add **environment variables** for Supabase URL and keys in `.env.local`
>
> ## Constraints:
>
> * Do not use Express anymore; move all backend logic to Next.js APIs or server components
> * Migrate UI to use **Next.js layouts**, **React Server Components**, and **Client Components** where necessary
> * Ensure that auth-protected routes verify session using Supabase
> * Use **PostgreSQL queries** via Supabase client, not ORMs unless strictly needed
> * Ensure all existing frontend functionality (pages, forms, data fetching) is preserved or improved
>
> ## First Task:
>
> Start by setting up a new Next.js 14+ App Router project with:
>
> * Supabase client initialized
> * Supabase auth helpers configured
> * `/app/login` and `/app/signup` pages using Supabase auth
> * `/app/dashboard` page that is protected (only accessible with active session)
>
> Explain all configs and folder layout decisions.

-----


great, now let's try ti run nextjs application so I can browse it and test functionality. As I see in env.local we have supabase url and other properties. You have access to supabase mcp server, so I want you to fill these variables

-----

in the home page, in navbar I only see sign in button, add also sign up button

-----

Now I see signup button but it is just white button with shadow and text is not visible

-----

when user goes to signup or signin screen there is no navbar shown there, so user must click browser back button to go on home screen. Let's fix it

-----

on signin or signup page there is not button where user click, clicking enter button works but we need actual button

-----

find TailAdmin documentation in context7 and always use components from it.

-----

forget tailadmin, remove any references to it and use magic ui with help of its mcp server. Also if you need web search ask perplexity mcp

-----

do we have all necessary libraries installed to use magic UI? As I know it needs shadcn

-----

do not create any magic ui similar components, just use it's components. if you can not execute command in terminal let me kknow and I will do it manually

-----

I executed command in teminal and added magic ui war-background, ripple-button and aurora-text

-----

use magic ui on home page, if you need any element let me know and I will install

-----


remove globe from hero section. use this magic ui template called `SaaS Template`
https://saas-magicui.vercel.app/

-----

in home page implement navbar similar to this magic ui template https://saas-magicui.vercel.app/

-----

now it is great, just one correction. behind navbar there is white background which is not needed, navbar can be directly on top of hero section

-----


now let's implement signup page similar to this magic ui template
https://saas-magicui.vercel.app/signup

Maybe there are some inputs which we do not need or maybe we have more inputs, adapt it to our project needs

-----

on signup page we have warp background which is annoying. Vhange it to magic ui dot pattern, also remove meteors from signup card. Also remove left side of signup screen where are svg, just leave input form

-----
now I see dot pattern. Let's make signup form less wide, also add meteors to whole page background with dot pattern

-----

remove meteors from background, does not look good. also make border-beam more visible and slower

-----

do not modify any components inside @zenturno-next/src/components/magicui they are downloaded, just pass different values in parameters when I ask to modify

-----
use same styles for signin page

-----
login form inputs are not same as register, use magic ui

-----
remove navbar from auth pages, take same logo from home page and put on top center of auth pages, it must be clickable and take user to home screen

-----
expand dot pattern background on auth page to every element, logo and form 

-----

Fix appointment booking system functionality. The service selector shows no information when creating new appointments, and subsequent steps in the booking flow are not working properly.

-----

After fixing services table, when selecting professionals there's an error. The professionals table exists but appears empty and has incorrect schema with only user_id column but missing name, specialty, email, phone columns.

-----

After selecting service and professional, the "Continue to Confirmation" button shows "Missing required fields" error. The issue is in createAppointment action using parseInt() on UUID strings causing serviceId and professionalId to become NaN.

-----

After successful appointment creation, the UI shows "An unexpected error occurred" even though the appointment is created in database. The problem is that redirect() in Next.js 15 throws a NEXT_REDIRECT exception which is being caught by try/catch.

-----

The appointments page shows "column appointments.date_time does not exist" error after successful appointment creation. There's inconsistency between CREATE operations using 'date' and READ operations using 'date_time' column names.

-----

Remove all debugging logs added during troubleshooting from BookingForm.tsx and appointment.ts. Clean up console.log statements, debug useEffect hooks, and restore original styling while keeping essential functionality.

-----

Professional registration email confirmation works but no record is created in database. Console shows "new row violates row-level security policy for table professionals" error. Need to fix RLS policies to allow authenticated users to insert professional records.

-----

When confirming appointments, the confirmation button appears briefly with a NEXT_REDIRECT error message before the flow continues correctly. Fix the error handling to filter out NEXT_REDIRECT exceptions since they are normal behavior in Next.js 15.

-----