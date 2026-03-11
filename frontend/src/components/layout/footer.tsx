import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">{APP_NAME}</p>
          <p className="mt-2 text-sm text-slate-600">Secure IPFS gateway for decentralized storage workflows.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Quick links</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>
              <Link className="transition hover:text-slate-900" href="/upload">
                Upload
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-slate-900" href="/retrieve">
                Retrieve
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-slate-900" href="/files">
                Files
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Resources</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>
              <Link className="transition hover:text-slate-900" href="/docs">
                Documentation
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-slate-900" href="/register">
                Create account
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-slate-900" href="/login">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-200 px-4 pt-5 text-xs text-slate-500 sm:px-6">
        Copyright {year} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
