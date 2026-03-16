"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/docs/code-block";

const TABS = ["cURL", "Python", "JavaScript"] as const;
type Tab = (typeof TABS)[number];

const CURL_REGISTER = `curl -X POST https://your-domain.com/api/v1/users/register \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "securePassword123"}'`;

const CURL_UPLOAD = `curl -X POST https://your-domain.com/api/v1/files/upload \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@/path/to/your/file.pdf"`;

const CURL_RETRIEVE = `curl https://your-domain.com/api/v1/files/retrieve/bafkreih5... \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -o downloaded_file.pdf`;

const CURL_LIST = `curl https://your-domain.com/api/v1/files \\
  -H "X-API-Key: YOUR_API_KEY"`;

const CURL_DELETE = `curl -X DELETE https://your-domain.com/api/v1/files/bafkreih5... \\
  -H "X-API-Key: YOUR_API_KEY"`;

const PYTHON_REGISTER = `import requests

url = "https://your-domain.com/api/v1/users/register"
payload = {"email": "user@example.com", "password": "securePassword123"}

response = requests.post(url, json=payload)
data = response.json()
print("API Key:", data["data"]["api_key"])  # save this!`;

const PYTHON_UPLOAD = `import requests

url = "https://your-domain.com/api/v1/files/upload"
headers = {"X-API-Key": "YOUR_API_KEY"}

with open("/path/to/file.pdf", "rb") as f:
    response = requests.post(url, headers=headers, files={"file": f})

data = response.json()
cid = data["data"]["cid"]
print("CID:", cid)`;

const PYTHON_RETRIEVE = `import requests

cid = "bafkreih5..."
url = f"https://your-domain.com/api/v1/files/retrieve/{cid}"
headers = {"X-API-Key": "YOUR_API_KEY"}

response = requests.get(url, headers=headers)
with open("downloaded_file.pdf", "wb") as f:
    f.write(response.content)`;

const PYTHON_LIST = `import requests

url = "https://your-domain.com/api/v1/files"
headers = {"X-API-Key": "YOUR_API_KEY"}

response = requests.get(url, headers=headers)
files = response.json()["data"]
for file in files:
    print(file["cid"], file["original_filename"])`;

const PYTHON_DELETE = `import requests

cid = "bafkreih5..."
url = f"https://your-domain.com/api/v1/files/{cid}"
headers = {"X-API-Key": "YOUR_API_KEY"}

response = requests.delete(url, headers=headers)
print(response.json()["message"])`;

const JS_REGISTER = `const response = await fetch("https://your-domain.com/api/v1/users/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securePassword123",
  }),
});
const data = await response.json();
const apiKey = data.data.api_key; // save this!
console.log("API Key:", apiKey);`;

const JS_UPLOAD = `const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append("file", file);

const response = await fetch("https://your-domain.com/api/v1/files/upload", {
  method: "POST",
  headers: { "X-API-Key": "YOUR_API_KEY" },
  body: formData,
});

const data = await response.json();
console.log("CID:", data.data.cid);`;

const JS_RETRIEVE = `const cid = "bafkreih5...";
const response = await fetch(
  \`https://your-domain.com/api/v1/files/retrieve/\${cid}\`,
  { headers: { "X-API-Key": "YOUR_API_KEY" } },
);

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "downloaded_file";
a.click();`;

const JS_LIST = `const response = await fetch("https://your-domain.com/api/v1/files", {
  headers: { "X-API-Key": "YOUR_API_KEY" },
});

const { data } = await response.json();
data.forEach((file) => {
  console.log(file.cid, file.original_filename);
});`;

const JS_DELETE = `const cid = "bafkreih5...";
const response = await fetch(
  \`https://your-domain.com/api/v1/files/\${cid}\`,
  {
    method: "DELETE",
    headers: { "X-API-Key": "YOUR_API_KEY" },
  },
);
const data = await response.json();
console.log(data.message);`;

const EXAMPLES: Record<Tab, { id: string; title: string; code: string; language: string; filename: string }[]> = {
  cURL: [
    { id: "curl-register", title: "Register", code: CURL_REGISTER, language: "bash", filename: "register.sh" },
    { id: "curl-upload", title: "Upload a file", code: CURL_UPLOAD, language: "bash", filename: "upload.sh" },
    { id: "curl-retrieve", title: "Retrieve a file", code: CURL_RETRIEVE, language: "bash", filename: "retrieve.sh" },
    { id: "curl-list", title: "List files", code: CURL_LIST, language: "bash", filename: "list.sh" },
    { id: "curl-delete", title: "Delete a file", code: CURL_DELETE, language: "bash", filename: "delete.sh" },
  ],
  Python: [
    { id: "py-register", title: "Register", code: PYTHON_REGISTER, language: "python", filename: "register.py" },
    { id: "py-upload", title: "Upload a file", code: PYTHON_UPLOAD, language: "python", filename: "upload.py" },
    { id: "py-retrieve", title: "Retrieve a file", code: PYTHON_RETRIEVE, language: "python", filename: "retrieve.py" },
    { id: "py-list", title: "List files", code: PYTHON_LIST, language: "python", filename: "list.py" },
    { id: "py-delete", title: "Delete a file", code: PYTHON_DELETE, language: "python", filename: "delete.py" },
  ],
  JavaScript: [
    { id: "js-register", title: "Register", code: JS_REGISTER, language: "javascript", filename: "register.js" },
    { id: "js-upload", title: "Upload a file", code: JS_UPLOAD, language: "javascript", filename: "upload.js" },
    { id: "js-retrieve", title: "Retrieve a file", code: JS_RETRIEVE, language: "javascript", filename: "retrieve.js" },
    { id: "js-list", title: "List files", code: JS_LIST, language: "javascript", filename: "list.js" },
    { id: "js-delete", title: "Delete a file", code: JS_DELETE, language: "javascript", filename: "delete.js" },
  ],
};

export default function CodeExamplesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cURL");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Code Examples</h1>
        <p className="mt-3 text-lg text-slate-600">
          Copy-ready code snippets for the most common operations in cURL, Python, and JavaScript.
        </p>
      </div>

      <div
        aria-label="Select programming language"
        className="flex w-fit gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            aria-controls={`panel-${tab.toLowerCase()}`}
            aria-selected={activeTab === tab}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id={`tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
          >
            {tab}
          </button>
        ))}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab}
          aria-labelledby={`tab-${tab.toLowerCase()}`}
          className="space-y-6"
          hidden={activeTab !== tab}
          id={`panel-${tab.toLowerCase()}`}
          role="tabpanel"
        >
          {EXAMPLES[tab].map(({ id, title, code, language, filename }) => (
            <section id={id} key={id}>
              <h2 className="mb-2 text-base font-semibold text-slate-800">{title}</h2>
              <CodeBlock code={code} filename={filename} language={language} />
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}
