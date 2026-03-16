import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Learn how to authenticate every API request using your API key.",
};

export default function AuthenticationPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Authentication</h1>
        <p className="mt-3 text-lg text-slate-600">
          Every protected endpoint requires an API key sent via a request header.
        </p>
      </div>

      {/* API Key Header */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="api-key-header">API Key Header</h2>
        <p className="mt-2 text-sm text-slate-600">
          Include the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">X-API-Key</code> header in every
          request that requires authentication. Replace{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">YOUR_API_KEY</code> with the key from your
          dashboard.
        </p>
        <div className="mt-4 space-y-4">
          <CodeBlock
            language="bash"
            filename="request.sh"
            code={`curl https://your-domain.com/api/v1/files \\
  -H "X-API-Key: YOUR_API_KEY"`}
          />
          <CodeBlock
            language="python"
            filename="request.py"
            code={`import requests

headers = {"X-API-Key": "YOUR_API_KEY"}
response = requests.get("https://your-domain.com/api/v1/files", headers=headers)
print(response.json())`}
          />
          <CodeBlock
            language="javascript"
            filename="request.js"
            code={`const response = await fetch("https://your-domain.com/api/v1/files", {
  headers: { "X-API-Key": "YOUR_API_KEY" },
});
const data = await response.json();
console.log(data);`}
          />
        </div>

        <h3 className="mt-6 text-base font-semibold text-slate-800" id="public-endpoints">Public Endpoints</h3>
        <p className="mt-2 text-sm text-slate-600">
          The following endpoints do not require authentication:
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2 text-left font-semibold text-slate-700">Method</th>
              <th className="pb-2 text-left font-semibold text-slate-700">Path</th>
              <th className="pb-2 text-left font-semibold text-slate-700">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { method: "POST", path: "/api/v1/users/register", desc: "Create a new account" },
              { method: "POST", path: "/api/v1/users/renew/challenge", desc: "Request key renewal code" },
              { method: "POST", path: "/api/v1/users/renew", desc: "Complete key renewal" },
            ].map((row) => (
              <tr key={row.path}>
                <td className="py-2 pr-4">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-emerald-800">
                    {row.method}
                  </span>
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-slate-800">{row.path}</td>
                <td className="py-2 text-slate-600">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-6 text-base font-semibold text-slate-800" id="error-responses">Authentication Error Responses</h3>
        <p className="mt-2 text-sm text-slate-600">
          If authentication fails the server responds with one of the following:
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2 text-left font-semibold text-slate-700">Status</th>
              <th className="pb-2 text-left font-semibold text-slate-700">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { code: "401", reason: "No X-API-Key header provided" },
              { code: "401", reason: "API key does not match any registered user" },
              { code: "403", reason: "Account is suspended or the key has been invalidated" },
            ].map((row, i) => (
              <tr key={i}>
                <td className="py-2 pr-4 font-mono text-xs font-semibold text-red-700">{row.code}</td>
                <td className="py-2 text-slate-600">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Security Best Practices */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="security">Security Best Practices</h2>
        <p className="mt-2 text-sm text-slate-600">
          Follow these guidelines to keep your API key safe.
        </p>
        <ul className="mt-4 space-y-3">
          {[
            {
              title: "Never hardcode your key",
              body: 'Store it in environment variables (e.g. NEXT_PUBLIC_API_KEY in .env.local) or a secrets manager.',
            },
            {
              title: "Never commit it to source control",
              body: "Add .env* to your .gitignore file. Treat the key with the same care as a database password.",
            },
            {
              title: "Rotate periodically",
              body: "Use the renewal flow in the dashboard to generate a new key. The old key is invalidated immediately.",
            },
            {
              title: "Use HTTPS only",
              body: "Always make API calls over HTTPS. Plain HTTP requests can expose your key to network observers.",
            },
            {
              title: "Do not share your key",
              body: "Each team member should have their own account and API key for auditability.",
            },
          ].map(({ title, body }) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
        <Callout type="warning" title="Leaked Key?">
          If you suspect your API key has been compromised, renew it immediately from the dashboard. All in-flight
          requests using the old key will receive a 401 response.
        </Callout>

        <h3 className="mt-6 text-base font-semibold text-slate-800" id="env-example">Environment Variable Example</h3>
        <CodeBlock
          language="bash"
          filename=".env.local"
          code={`# .env.local — never commit this file
IPFS_API_KEY=your_api_key_here`}
        />
        <CodeBlock
          language="javascript"
          filename="api-client.ts"
          code={`// Read from environment at build time (server components)
const API_KEY = process.env.IPFS_API_KEY ?? "";

// Or at runtime for client components (prefix NEXT_PUBLIC_)
const API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY ?? "";`}
        />
      </section>
    </div>
  );
}
