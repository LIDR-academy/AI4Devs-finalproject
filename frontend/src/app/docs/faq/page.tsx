import type { Metadata } from "next";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about IPFS, CIDs, rate limits, and the IPFS Gateway service.",
};

const faqs: { id: string; question: string; answer: React.ReactNode }[] = [
  {
    id: "what-is-ipfs",
    question: "What is IPFS?",
    answer: (
      <>
        <p>
          IPFS (InterPlanetary File System) is a peer-to-peer, content-addressed distributed file system. Unlike
          traditional HTTP where content is located by URL (server address), IPFS locates content by its{" "}
          <strong>CID</strong> (Content Identifier) — a cryptographic hash of the data itself.
        </p>
        <p className="mt-2">
          This means the same file stored on multiple nodes always has the same CID, enabling redundancy, resilience,
          and verifiable integrity without a central server.
        </p>
      </>
    ),
  },
  {
    id: "what-is-cid",
    question: "What is a CID?",
    answer: (
      <>
        <p>
          A CID (Content Identifier) is a unique fingerprint derived from the cryptographic hash of a file&apos;s
          contents. It looks like{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            bafkreih5aznjvttude6c3wbvqeebb6rlx7kibuzn7i56aklrbb2a5v53em
          </code>
          .
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
          <li>Two identical files always produce the same CID.</li>
          <li>Changing even a single byte produces a completely different CID.</li>
          <li>You can use the CID to verify a retrieved file has not been tampered with.</li>
        </ul>
      </>
    ),
  },
  {
    id: "delete",
    question: "Why can't I permanently delete a file from IPFS?",
    answer: (
      <>
        <p>
          IPFS is a decentralised network. Once a file is published and picked up by other nodes, you cannot force
          those other nodes to remove it. What the{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">DELETE</code> and{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">unpin</code> endpoints do is:
        </p>
        <ol className="mt-2 list-decimal list-inside space-y-1 text-slate-600">
          <li>Remove the record from your account metadata.</li>
          <li>Unpin the file from the gateway node so it becomes eligible for local garbage collection.</li>
        </ol>
        <p className="mt-2">
          If no other node holds a copy, the file will eventually disappear from the network after garbage collection
          runs. Files that were widely fetched may persist on third-party caching nodes indefinitely.
        </p>
      </>
    ),
  },
  {
    id: "rate-limits",
    question: "What are the rate limits?",
    answer: (
      <>
        <p>Rate limits are enforced per API key to protect service quality for all users:</p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2 text-left font-semibold text-slate-700">Endpoint group</th>
              <th className="pb-2 text-left font-semibold text-slate-700">Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr>
              <td className="py-2 pr-4">Registration / renewal</td>
              <td className="py-2">5 requests / 10 minutes</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">File uploads</td>
              <td className="py-2">100 requests / hour</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">File retrieval</td>
              <td className="py-2">500 requests / hour</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">All other authenticated endpoints</td>
              <td className="py-2">200 requests / hour</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-slate-600">
          When a limit is exceeded the API responds with{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">429 Too Many Requests</code> and sets a{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Retry-After</code> header with the number of
          seconds to wait.
        </p>
      </>
    ),
  },
  {
    id: "file-size",
    question: "What is the maximum file size?",
    answer: (
      <p>
        The default maximum upload size is <strong>100 MB</strong> per file. Attempting to upload a larger file will
        return a{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">400 Bad Request</code>. If your use case requires
        larger uploads, contact support to discuss custom limits.
      </p>
    ),
  },
  {
    id: "supported-formats",
    question: "Which file formats are supported?",
    answer: (
      <>
        <p>
          The API accepts any file format — IPFS is content-agnostic. The gateway validates that the uploaded content
          is a real file with a non-empty body but does not restrict by extension or MIME type.
        </p>
        <Callout type="info">
          The frontend upload UI may enforce browser-side MIME type filtering for UX purposes. The API itself has no
          such restriction.
        </Callout>
      </>
    ),
  },
  {
    id: "lost-api-key",
    question: "I lost my API key. What do I do?",
    answer: (
      <p>
        Use the key renewal flow: navigate to{" "}
        <Link href="/docs/authentication#renew" className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900">
          /docs/authentication
        </Link>{" "}
        for step-by-step instructions, or call{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/v1/users/renew/challenge</code> with
        your email to receive a verification code, then complete the renewal with{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/v1/users/renew</code>. Your new key is
        returned in the response.
      </p>
    ),
  },
  {
    id: "pinning",
    question: "What is pinning and why does it matter?",
    answer: (
      <>
        <p>
          In IPFS, <strong>pinning</strong> tells a node to keep a copy of a file and never garbage-collect it. Without
          pinning, nodes may discard infrequently accessed content to free space.
        </p>
        <p className="mt-2">
          All files uploaded through this gateway are <strong>pinned by default</strong>. You can explicitly unpin a
          file using the{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/v1/files/{"{cid}"}/unpin</code>{" "}
          endpoint if you no longer need guaranteed availability.
        </p>
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">FAQ</h1>
        <p className="mt-3 text-lg text-slate-600">
          Answers to the most common questions about IPFS, CIDs, API keys, and the gateway service.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map(({ id, question, answer }) => (
          <section
            key={id}
            id={id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-8"
          >
            <h2 className="text-lg font-semibold text-slate-900">{question}</h2>
            <div className="mt-3 text-sm text-slate-700 leading-relaxed">{answer}</div>
          </section>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <p className="font-semibold">Still have questions?</p>
        <p className="mt-1">
          Browse the{" "}
          <Link href="/docs/api-reference" className="underline underline-offset-2 hover:text-emerald-900">
            API Reference
          </Link>{" "}
          or{" "}
          <Link href="/docs/code-examples" className="underline underline-offset-2 hover:text-emerald-900">
            Code Examples
          </Link>{" "}
          for detailed documentation and copy-ready snippets.
        </p>
      </div>
    </div>
  );
}
