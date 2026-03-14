import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "API Reference",
  description: "Complete reference for all IPFS Gateway API endpoints: users, files, tasks, and error codes.",
};

// ────────────────────────────────────────────────────────────────
// Small presentational helpers (server-only, no "use client")
// ────────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const colours: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-emerald-100 text-emerald-800",
    DELETE: "bg-red-100 text-red-800",
    PUT: "bg-amber-100 text-amber-800",
    PATCH: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 font-mono text-xs font-bold ${colours[method] ?? "bg-slate-100 text-slate-700"}`}
    >
      {method}
    </span>
  );
}

interface EndpointProps {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  params?: { name: string; in: string; required: boolean; type: string; description: string }[];
  requestBody?: string;
  response: string;
  id?: string;
}

function Endpoint({ method, path, description, auth = true, params, requestBody, response, id }: EndpointProps) {
  return (
    <div id={id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <MethodBadge method={method} />
        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-800">{path}</code>
        {auth && (
          <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
            🔑 requires API key
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600">{description}</p>
      {params && params.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Parameters</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-1 text-left font-semibold text-slate-600">Name</th>
                <th className="pb-1 text-left font-semibold text-slate-600">In</th>
                <th className="pb-1 text-left font-semibold text-slate-600">Required</th>
                <th className="pb-1 text-left font-semibold text-slate-600">Type</th>
                <th className="pb-1 text-left font-semibold text-slate-600">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {params.map((p) => (
                <tr key={p.name}>
                  <td className="py-1 pr-2 font-mono text-slate-800">{p.name}</td>
                  <td className="py-1 pr-2 text-slate-500">{p.in}</td>
                  <td className="py-1 pr-2">{p.required ? <span className="text-red-600">yes</span> : "no"}</td>
                  <td className="py-1 pr-2 text-slate-500">{p.type}</td>
                  <td className="py-1 text-slate-500">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {requestBody && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Request Body</p>
          <CodeBlock language="json" code={requestBody} />
        </div>
      )}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Response</p>
        <CodeBlock language="json" code={response} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────

export default function ApiReferencePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">API Reference</h1>
        <p className="mt-3 text-lg text-slate-600">
          Complete reference for all REST endpoints. All paths are relative to{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">/api/v1</code>.
        </p>
      </div>

      {/* ── Users ── */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="users">Users</h2>
        <p className="mt-2 mb-4 text-sm text-slate-600">Endpoints for account creation and API key lifecycle.</p>
        <div className="space-y-4">
          <Endpoint
            id="register"
            method="POST"
            path="/api/v1/users/register"
            auth={false}
            description="Create a new user account. Returns the generated API key — it is shown only once."
            requestBody={`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}
            response={`{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "email": "user@example.com",
    "api_key": "ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "created_at": "2026-03-14T12:00:00Z"
  }
}`}
          />
          <Endpoint
            id="renew-challenge"
            method="POST"
            path="/api/v1/users/renew/challenge"
            auth={false}
            description="Request a key-renewal verification code. The code is sent to the account's registered email."
            requestBody={`{
  "email": "user@example.com"
}`}
            response={`{
  "status": 200,
  "message": "Verification code sent to email"
}`}
          />
          <Endpoint
            id="renew"
            method="POST"
            path="/api/v1/users/renew"
            auth={false}
            description="Complete the renewal flow using the verification code. Returns a new API key."
            requestBody={`{
  "email": "user@example.com",
  "verification_code": "123456"
}`}
            response={`{
  "status": 200,
  "message": "API key renewed successfully",
  "data": {
    "api_key": "ak_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
  }
}`}
          />
          <Endpoint
            id="user-status"
            method="GET"
            path="/api/v1/users/status"
            auth
            description="Return the authenticated user's account status and metadata."
            response={`{
  "status": 200,
  "data": {
    "email": "user@example.com",
    "created_at": "2026-03-14T12:00:00Z",
    "file_count": 42,
    "total_size_bytes": 10485760
  }
}`}
          />
        </div>
      </section>

      {/* ── Files ── */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="files">Files</h2>
        <p className="mt-2 mb-4 text-sm text-slate-600">Upload, retrieve, list, delete, pin, and unpin files on IPFS.</p>
        <div className="space-y-4">
          <Endpoint
            id="file-upload"
            method="POST"
            path="/api/v1/files/upload"
            auth
            description="Upload a file as multipart/form-data. Returns the file's IPFS CID and metadata."
            params={[
              { name: "file", in: "formData", required: true, type: "binary", description: "The file to upload" },
            ]}
            response={`{
  "status": 201,
  "message": "File uploaded successfully",
  "data": {
    "cid": "bafkreih5aznjvttude6c3wbvqeebb6rlx7kibuzn7i56aklrbb2a5v53em",
    "original_filename": "report.pdf",
    "size": 204800,
    "content_type": "application/pdf",
    "pinned": true,
    "uploaded_at": "2026-03-14T12:00:00Z"
  }
}`}
          />
          <Endpoint
            id="file-retrieve"
            method="GET"
            path="/api/v1/files/retrieve/{cid}"
            auth
            description="Retrieve (stream) a file by its CID. Responds with the file bytes and sets Content-Type."
            params={[
              { name: "cid", in: "path", required: true, type: "string", description: "IPFS Content Identifier" },
            ]}
            response={`<binary file content with appropriate Content-Type header>`}
          />
          <Endpoint
            id="file-list"
            method="GET"
            path="/api/v1/files"
            auth
            description="List all files uploaded by the authenticated user."
            response={`{
  "status": 200,
  "data": [
    {
      "cid": "bafkreih5...",
      "original_filename": "report.pdf",
      "size": 204800,
      "pinned": true,
      "uploaded_at": "2026-03-14T12:00:00Z"
    }
  ]
}`}
          />
          <Endpoint
            id="file-delete"
            method="DELETE"
            path="/api/v1/files/{cid}"
            auth
            description="Delete a single file by CID. Unpins and removes metadata."
            params={[
              { name: "cid", in: "path", required: true, type: "string", description: "IPFS Content Identifier" },
            ]}
            response={`{
  "status": 200,
  "message": "File deleted successfully"
}`}
          />
          <Endpoint
            id="file-bulk-delete"
            method="POST"
            path="/api/v1/files/delete/bulk"
            auth
            description="Delete multiple files in a single request."
            requestBody={`{
  "cids": [
    "bafkreih5...",
    "bafkreih6..."
  ]
}`}
            response={`{
  "status": 200,
  "message": "Files deleted successfully",
  "data": {
    "deleted": 2,
    "failed": []
  }
}`}
          />
          <Endpoint
            id="file-pin"
            method="POST"
            path="/api/v1/files/{cid}/pin"
            auth
            description="Pin a file on IPFS to ensure it remains available."
            params={[
              { name: "cid", in: "path", required: true, type: "string", description: "IPFS Content Identifier" },
            ]}
            response={`{
  "status": 200,
  "message": "File pinned successfully"
}`}
          />
          <Endpoint
            id="file-unpin"
            method="POST"
            path="/api/v1/files/{cid}/unpin"
            auth
            description="Unpin a file from IPFS. The content may eventually be garbage-collected."
            params={[
              { name: "cid", in: "path", required: true, type: "string", description: "IPFS Content Identifier" },
            ]}
            response={`{
  "status": 200,
  "message": "File unpinned successfully"
}`}
          />
        </div>
      </section>

      {/* ── Tasks ── */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="tasks">Tasks</h2>
        <p className="mt-2 mb-4 text-sm text-slate-600">
          Long-running operations (e.g. bulk deletes, background pin jobs) are handled by Celery tasks. Poll the status
          endpoint to track progress.
        </p>
        <Endpoint
          id="task-status"
          method="GET"
          path="/api/v1/tasks/{task_id}/status"
          auth
          description="Return the current status of an async Celery task."
          params={[
            { name: "task_id", in: "path", required: true, type: "string", description: "UUID returned when the task was started" },
          ]}
          response={`{
  "status": 200,
  "data": {
    "task_id": "d4a2c6f8-...",
    "state": "SUCCESS",
    "result": { "deleted": 3 },
    "created_at": "2026-03-14T12:00:00Z",
    "completed_at": "2026-03-14T12:00:05Z"
  }
}`}
        />
        <Callout type="info" title="Task States">
          Possible <code>state</code> values: <code>PENDING</code>, <code>STARTED</code>, <code>SUCCESS</code>,{" "}
          <code>FAILURE</code>, <code>REVOKED</code>.
        </Callout>
      </section>

      {/* ── Error Codes ── */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="error-codes">Error Codes</h2>
        <p className="mt-2 mb-4 text-sm text-slate-600">
          All error responses share the same envelope shape:
        </p>
        <CodeBlock
          language="json"
          code={`{
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable description of what went wrong"
}`}
        />
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2 text-left font-semibold text-slate-700">Code</th>
              <th className="pb-2 text-left font-semibold text-slate-700">Name</th>
              <th className="pb-2 text-left font-semibold text-slate-700">When it occurs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {[
              { code: "400", name: "Bad Request", when: "Malformed JSON, missing required fields, invalid file type or size" },
              { code: "401", name: "Unauthorized", when: "Missing or invalid X-API-Key header" },
              { code: "403", name: "Forbidden", when: "Account suspended or key invalidated" },
              { code: "404", name: "Not Found", when: "CID or resource does not exist for this user" },
              { code: "409", name: "Conflict", when: "Duplicate registration email or file already pinned" },
              { code: "422", name: "Unprocessable Entity", when: "Validation passed but business logic rejected the request" },
              { code: "429", name: "Too Many Requests", when: "Rate limit exceeded; check Retry-After header" },
              { code: "500", name: "Internal Server Error", when: "Unexpected server-side error; contact support" },
            ].map((row) => (
              <tr key={row.code}>
                <td className="py-2 pr-4 font-mono font-semibold text-red-700">{row.code}</td>
                <td className="py-2 pr-4">{row.name}</td>
                <td className="py-2 text-slate-500">{row.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
