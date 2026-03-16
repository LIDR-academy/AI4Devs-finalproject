export type SearchEntry = {
  title: string;
  slug: string;
  section: string;
  excerpt: string;
};

export const SEARCH_INDEX: SearchEntry[] = [
  {
    title: "Documentation Home",
    slug: "/docs",
    section: "Overview",
    excerpt: "Welcome to the IPFS Gateway documentation. Find guides, API references, and code examples.",
  },
  {
    title: "Getting Started",
    slug: "/docs/getting-started",
    section: "Getting Started",
    excerpt: "Quick start guide to get up and running with the IPFS Gateway in minutes.",
  },
  {
    title: "Quick Start",
    slug: "/docs/getting-started#quick-start",
    section: "Getting Started",
    excerpt: "Three-step checklist: register an account, retrieve your API key, and upload your first file.",
  },
  {
    title: "Registration Walkthrough",
    slug: "/docs/getting-started#registration",
    section: "Getting Started",
    excerpt: "Step-by-step guide to creating your IPFS Gateway account and completing registration.",
  },
  {
    title: "First Upload Tutorial",
    slug: "/docs/getting-started#first-upload",
    section: "Getting Started",
    excerpt:
      "Learn how to upload your first file to IPFS using a cURL command or through the web interface.",
  },
  {
    title: "API Key Management",
    slug: "/docs/getting-started#api-key",
    section: "Getting Started",
    excerpt: "How to view, copy, and manage your API key from the dashboard.",
  },
  {
    title: "Authentication",
    slug: "/docs/authentication",
    section: "Authentication",
    excerpt: "Learn how authentication works: API key header, request security, and best practices.",
  },
  {
    title: "Using the X-API-Key Header",
    slug: "/docs/authentication#api-key-header",
    section: "Authentication",
    excerpt: "All authenticated requests must include the X-API-Key header with your personal API key.",
  },
  {
    title: "Security Best Practices",
    slug: "/docs/authentication#security",
    section: "Authentication",
    excerpt:
      "Keep your API key secret, rotate it regularly, and never expose it in client-side code.",
  },
  {
    title: "API Reference",
    slug: "/docs/api-reference",
    section: "API Reference",
    excerpt: "Complete reference for all REST API endpoints: users, files, and tasks.",
  },
  {
    title: "POST /api/v1/users/register",
    slug: "/docs/api-reference#register",
    section: "API Reference",
    excerpt: "Register a new user account and receive a generated API key.",
  },
  {
    title: "POST /api/v1/users/renew/challenge",
    slug: "/docs/api-reference#renew-challenge",
    section: "API Reference",
    excerpt: "Initiate the API key renewal flow by requesting a verification code.",
  },
  {
    title: "POST /api/v1/users/renew",
    slug: "/docs/api-reference#renew",
    section: "API Reference",
    excerpt: "Complete API key renewal by submitting the verification code.",
  },
  {
    title: "POST /api/v1/files/upload",
    slug: "/docs/api-reference#upload",
    section: "API Reference",
    excerpt: "Upload a file to IPFS. Returns the CID upon success.",
  },
  {
    title: "GET /api/v1/files/retrieve/:cid",
    slug: "/docs/api-reference#retrieve",
    section: "API Reference",
    excerpt: "Retrieve a file from IPFS by its CID. Returns the file bytes.",
  },
  {
    title: "GET /api/v1/files",
    slug: "/docs/api-reference#list",
    section: "API Reference",
    excerpt: "List all files uploaded by the authenticated user with pagination and sorting.",
  },
  {
    title: "DELETE /api/v1/files/:cid",
    slug: "/docs/api-reference#delete",
    section: "API Reference",
    excerpt: "Soft-delete a file owned by the authenticated user.",
  },
  {
    title: "POST /api/v1/files/delete/bulk",
    slug: "/docs/api-reference#bulk-delete",
    section: "API Reference",
    excerpt: "Soft-delete multiple files in a single request.",
  },
  {
    title: "Error Codes Reference",
    slug: "/docs/api-reference#error-codes",
    section: "API Reference",
    excerpt:
      "Standard HTTP error codes returned by the API: 400 Bad Request, 401 Unauthorized, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error.",
  },
  {
    title: "Code Examples",
    slug: "/docs/code-examples",
    section: "Code Examples",
    excerpt: "Python, JavaScript / Node.js, and cURL examples for the most common API operations.",
  },
  {
    title: "cURL Examples",
    slug: "/docs/code-examples#curl",
    section: "Code Examples",
    excerpt: "Command-line examples using curl for registration, upload, retrieve, and delete.",
  },
  {
    title: "Python Examples",
    slug: "/docs/code-examples#python",
    section: "Code Examples",
    excerpt: "Python code samples using the requests library to interact with the IPFS Gateway API.",
  },
  {
    title: "JavaScript Examples",
    slug: "/docs/code-examples#javascript",
    section: "Code Examples",
    excerpt: "JavaScript / Node.js examples using the fetch API to interact with the IPFS Gateway.",
  },
  {
    title: "FAQ",
    slug: "/docs/faq",
    section: "FAQ",
    excerpt: "Frequently asked questions about the IPFS Gateway platform.",
  },
  {
    title: "What is IPFS?",
    slug: "/docs/faq#what-is-ipfs",
    section: "FAQ",
    excerpt:
      "IPFS (InterPlanetary File System) is a distributed, peer-to-peer protocol for storing and sharing data.",
  },
  {
    title: "What is a CID?",
    slug: "/docs/faq#what-is-cid",
    section: "FAQ",
    excerpt:
      "A CID (Content Identifier) is a unique hash that identifies a file on the IPFS network based on its content.",
  },
  {
    title: "Why can I not delete a file?",
    slug: "/docs/faq#delete",
    section: "FAQ",
    excerpt:
      "Files are soft-deleted from your account. Due to the nature of IPFS, content may remain accessible on the network.",
  },
  {
    title: "Rate Limits",
    slug: "/docs/faq#rate-limits",
    section: "FAQ",
    excerpt: "The API enforces rate limits to ensure fair use. Learn what the limits are and how to handle 429 responses.",
  },
];
