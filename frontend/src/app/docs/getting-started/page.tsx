import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "Getting Started",
  description: "Quick start guide, registration walkthrough, first upload tutorial, and API key management.",
};

export default function GettingStartedPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Getting Started</h1>
        <p className="mt-3 text-lg text-slate-600">
          Everything you need to go from zero to uploading files on IPFS in minutes.
        </p>
      </div>

      {/* Quick Start */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="quick-start">Quick Start</h2>
        <p className="mt-2 text-sm text-slate-600">Follow these three steps to be up and running immediately.</p>
        <ol className="mt-4 space-y-4">
          {[
            {
              step: "1",
              title: "Create an account",
              body: (
                <>
                  Visit the{" "}
                  <Link href="/register" className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900">
                    registration page
                  </Link>{" "}
                  and fill in your email and a password. You will immediately receive a generated API key — save it securely.
                </>
              ),
            },
            {
              step: "2",
              title: "Retrieve your API key",
              body: (
                <>
                  Log in and navigate to your{" "}
                  <Link href="/dashboard" className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900">
                    dashboard
                  </Link>
                  . Your API key is displayed there; click to copy it.
                </>
              ),
            },
            {
              step: "3",
              title: "Upload your first file",
              body: "Use the Upload page in the app, or send a request directly to the API (see the cURL example below).",
            },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {step}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Registration */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="registration">Registration Walkthrough</h2>
        <p className="mt-2 text-sm text-slate-600">
          Registration is free and requires only an email address and password.
        </p>
        <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-slate-700">
          <li>Navigate to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/register</code>.</li>
          <li>Enter a valid email address and a password of at least 8 characters.</li>
          <li>Submit the form. On success you will see your <strong>API key</strong> displayed in a modal — copy it now.</li>
          <li>The API key is shown only once. Store it in a password manager or environment variable.</li>
          <li>You are now redirected to the dashboard where you can begin uploading files.</li>
        </ol>
        <Callout type="warning" title="API Key Visibility">
          Your API key is displayed only once on the registration success screen. If you lose it, you must renew it
          from the dashboard using the renewal flow (a verification code will be sent to your email).
        </Callout>
      </section>

      {/* First Upload */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="first-upload">First Upload Tutorial</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload a file using the web interface or directly via the API.
        </p>
        <h3 className="mt-4 text-base font-semibold text-slate-800" id="upload-via-ui">Using the web interface</h3>
        <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-slate-700">
          <li>Log in and navigate to <Link href="/upload" className="text-emerald-700 underline underline-offset-2">/upload</Link>.</li>
          <li>Drag a file onto the dropzone or click <strong>Browse</strong> to select one.</li>
          <li>The file is validated client-side (type and size) before upload begins.</li>
          <li>Watch the live progress bar. On completion the CID is shown and copied to your upload history.</li>
        </ol>
        <h3 className="mt-4 text-base font-semibold text-slate-800" id="upload-via-api">Using the API</h3>
        <CodeBlock
          language="bash"
          filename="upload.sh"
          code={`curl -X POST https://your-domain.com/api/v1/files/upload \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@/path/to/your/file.pdf"`}
        />
        <p className="mt-2 text-sm text-slate-600">
          A successful response returns the file&apos;s CID:
        </p>
        <CodeBlock
          language="json"
          code={`{
  "status": 201,
  "message": "File uploaded successfully",
  "data": {
    "cid": "bafkreih5aznjvttude6c3wbvqeebb6rlx7kibuzn7i56aklrbb2a5v53em",
    "original_filename": "file.pdf",
    "size": 204800,
    "pinned": true,
    "uploaded_at": "2026-03-14T12:00:00Z"
  }
}`}
        />
        <Callout type="tip">
          Save the returned CID — it is the permanent address of your file on the IPFS network.
        </Callout>
      </section>

      {/* API Key Management */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900" id="api-key">API Key Management</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your API key authenticates every request to the IPFS Gateway API.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-emerald-600 font-bold">→</span>
            <span>
              <strong>View your key</strong>: Log in and go to the dashboard. The key is shown masked; click to reveal or copy it.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600 font-bold">→</span>
            <span>
              <strong>Renew your key</strong>: From the dashboard, initiate the renewal flow. A verification code is generated; submit it to confirm and receive a new key.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600 font-bold">→</span>
            <span>
              <strong>Use it in requests</strong>: Pass the key in the{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">X-API-Key</code> header for every authenticated endpoint.
            </span>
          </li>
        </ul>
        <Callout type="info" title="Key Rotation">
          Rotate your API key regularly. When you renew it, the old key is immediately invalidated.
        </Callout>
        <div className="mt-4">
          <Link
            href="/docs/authentication"
            className="inline-flex items-center gap-1 text-sm text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
          >
            Read the full authentication guide →
          </Link>
        </div>
      </section>
    </div>
  );
}
