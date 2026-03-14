import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Code2, Key, Rocket, Search, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides, API reference, and code examples for the IPFS Gateway.",
};

const SECTIONS = [
  {
    icon: <Rocket className="h-5 w-5 text-emerald-600" />,
    title: "Getting Started",
    description: "Quick start guide, registration walkthrough, and your first file upload.",
    href: "/docs/getting-started",
  },
  {
    icon: <Key className="h-5 w-5 text-emerald-600" />,
    title: "Authentication",
    description: "Understand API key usage, request headers, and security best practices.",
    href: "/docs/authentication",
  },
  {
    icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
    title: "API Reference",
    description: "Complete reference for all REST endpoints with request and response formats.",
    href: "/docs/api-reference",
  },
  {
    icon: <Code2 className="h-5 w-5 text-emerald-600" />,
    title: "Code Examples",
    description: "Ready-to-use examples in cURL, Python, and JavaScript.",
    href: "/docs/code-examples",
  },
  {
    icon: <Search className="h-5 w-5 text-emerald-600" />,
    title: "FAQ",
    description: "Answers to the most common questions about the IPFS Gateway.",
    href: "/docs/faq",
  },
  {
    icon: <HelpCircle className="h-5 w-5 text-emerald-600" />,
    title: "Error Codes",
    description: "HTTP error code reference and how to handle each error condition.",
    href: "/docs/api-reference#error-codes",
  },
];

export default function DocsHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900" id="documentation">
        Documentation
      </h1>
      <p className="mt-3 text-lg text-slate-600">
        Welcome to the IPFS Gateway documentation. Find everything you need to integrate decentralized file storage into your application.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              {section.icon}
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-emerald-700">{section.title}</p>
              <p className="mt-1 text-sm text-slate-600">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-800" id="quick-start">Quick Start</h2>
        <ol className="mt-3 space-y-2 text-sm text-emerald-900">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span>
            <span><Link href="/register" className="font-medium underline underline-offset-2">Register</Link> an account to receive your API key.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
            <span>Copy your API key from the <Link href="/dashboard" className="font-medium underline underline-offset-2">dashboard</Link>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">3</span>
            <span>
              Include the key in every request:{" "}
              <code className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-xs text-emerald-800">
                X-API-Key: your_key
              </code>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">4</span>
            <span>
              <Link href="/docs/getting-started#first-upload" className="font-medium underline underline-offset-2">Upload your first file</Link> and receive its IPFS CID.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
