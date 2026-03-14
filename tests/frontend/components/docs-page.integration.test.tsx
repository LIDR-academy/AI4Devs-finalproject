/**
 * Integration tests for US-108: Documentation Pages
 *
 * Covers:
 *  - DocsHomePage renders section cards and Quick Start
 *  - CodeBlock renders code content, copy button, and "Copied!" confirmation
 *  - DocsSearch returns results for a valid query and empty state
 *  - DocsSidebar renders all top-level nav items with correct hrefs
 *  - GettingStartedPage renders expected headings
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const pushMock = jest.fn();
let currentPathname = "/docs";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => currentPathname,
}));

// next/link renders a plain <a> in tests
jest.mock("next/link", () => {
  const MockLink = ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// IntersectionObserver is not implemented in jsdom
beforeAll(() => {
  global.IntersectionObserver = jest.fn().mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }) as unknown as typeof IntersectionObserver;
});

// Clipboard API
const writeTextMock = jest.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
});

// lucide-react icons — render a simple span to keep snapshots stable
jest.mock("lucide-react", () => {
  const icon = (name: string) => {
    const Cmp = ({ className }: { className?: string }) => <span data-testid={`icon-${name}`} className={className} />;
    Cmp.displayName = name;
    return Cmp;
  };
  return {
    AlertTriangle: icon("AlertTriangle"),
    BookOpen: icon("BookOpen"),
    Check: icon("Check"),
    ChevronDown: icon("ChevronDown"),
    ChevronRight: icon("ChevronRight"),
    Code2: icon("Code2"),
    Copy: icon("Copy"),
    FileText: icon("FileText"),
    HelpCircle: icon("HelpCircle"),
    Info: icon("Info"),
    Key: icon("Key"),
    Lightbulb: icon("Lightbulb"),
    Lock: icon("Lock"),
    Menu: icon("Menu"),
    Rocket: icon("Rocket"),
    Search: icon("Search"),
    Terminal: icon("Terminal"),
    Upload: icon("Upload"),
    X: icon("X"),
    Zap: icon("Zap"),
  };
});

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import DocsHomePage from "@/app/docs/page";
import GettingStartedPage from "@/app/docs/getting-started/page";
import { CodeBlock } from "@/components/docs/code-block";
import { DocsSearch } from "@/components/docs/docs-search";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
  pushMock.mockClear();
  writeTextMock.mockClear();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ── DocsHomePage ──────────────────────────────────────────────────────────────

describe("DocsHomePage", () => {
  test("renders the page heading", () => {
    render(<DocsHomePage />);
    expect(screen.getByRole("heading", { name: /Documentation/i, level: 1 })).toBeInTheDocument();
  });

  test("renders all six section cards", () => {
    render(<DocsHomePage />);
    // Section titles are rendered as <p> elements inside card links
    const expectedSections = [
      "Getting Started",
      "Authentication",
      "API Reference",
      "Code Examples",
      "FAQ",
      "Error Codes",
    ];
    for (const section of expectedSections) {
      expect(screen.getByText(section)).toBeInTheDocument();
    }
  });

  test("renders Quick Start section with numbered steps", () => {
    render(<DocsHomePage />);
    expect(screen.getByRole("heading", { name: /Quick Start/i })).toBeInTheDocument();
    // Step numbers 1–4 are present
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
  });

  test("section cards link to correct doc routes", () => {
    render(<DocsHomePage />);
    const gsLink = screen.getByRole("link", { name: /Getting Started/i });
    expect(gsLink).toHaveAttribute("href", "/docs/getting-started");
  });
});

// ── CodeBlock ─────────────────────────────────────────────────────────────────

describe("CodeBlock", () => {
  const CODE = `echo "hello world"`;

  test("renders the provided code text", () => {
    render(<CodeBlock code={CODE} language="bash" />);
    expect(screen.getByText(CODE)).toBeInTheDocument();
  });

  test("renders the language label in the header", () => {
    render(<CodeBlock code={CODE} language="bash" />);
    expect(screen.getByText("bash")).toBeInTheDocument();
  });

  test("renders optional filename when provided", () => {
    render(<CodeBlock code={CODE} language="bash" filename="script.sh" />);
    expect(screen.getByText("script.sh")).toBeInTheDocument();
  });

  test("renders copy button with accessible label", () => {
    render(<CodeBlock code={CODE} language="bash" />);
    expect(screen.getByRole("button", { name: /copy code/i })).toBeInTheDocument();
  });

  test("shows 'Copied!' and calls clipboard API after clicking copy", async () => {
    render(<CodeBlock code={CODE} language="bash" />);
    const copyBtn = screen.getByRole("button", { name: /copy code/i });

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith(CODE);
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });

  test("copy button reverts to 'Copy' after 2 seconds", async () => {
    render(<CodeBlock code={CODE} language="bash" />);
    const copyBtn = screen.getByRole("button", { name: /copy code/i });

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    await screen.findByText("Copied!");

    act(() => {
      jest.advanceTimersByTime(2001);
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  test("normalises language aliases (curl → bash)", () => {
    render(<CodeBlock code={CODE} language="curl" />);
    expect(screen.getByText("bash")).toBeInTheDocument();
  });

  test("normalises language aliases (py → python)", () => {
    render(<CodeBlock code="print('hi')" language="py" />);
    expect(screen.getByText("python")).toBeInTheDocument();
  });
});

// ── DocsSearch ────────────────────────────────────────────────────────────────

describe("DocsSearch", () => {
  test("renders the search input", () => {
    render(<DocsSearch />);
    expect(screen.getByRole("combobox", { name: /search documentation/i })).toBeInTheDocument();
  });

  test("shows no results initially", () => {
    render(<DocsSearch />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("shows results after typing a matching query", async () => {
    render(<DocsSearch />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "upload" } });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    // At least one result should mention "upload"
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
  });

  test("pressing Escape clears the query and closes the dropdown", async () => {
    render(<DocsSearch />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "upload" } });
    act(() => { jest.advanceTimersByTime(200); });

    await waitFor(() => screen.getByRole("listbox"));

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  test("navigates on Enter when an option is active", async () => {
    render(<DocsSearch />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "upload" } });
    act(() => { jest.advanceTimersByTime(200); });

    await waitFor(() => screen.getByRole("listbox"));

    // Move to first result with ArrowDown
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Press Enter to navigate
    fireEvent.keyDown(input, { key: "Enter" });

    expect(pushMock).toHaveBeenCalledTimes(1);
  });

  test("shows empty results for a query that matches nothing", async () => {
    render(<DocsSearch />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "xyzxyzxyz" } });
    act(() => { jest.advanceTimersByTime(200); });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});

// ── DocsSidebar ───────────────────────────────────────────────────────────────

describe("DocsSidebar", () => {
  test("renders all top-level navigation items", () => {
    currentPathname = "/docs";
    render(<DocsSidebar />);

    const topLevelLabels = [
      "Overview",
      "Getting Started",
      "Authentication",
      "API Reference",
      "Code Examples",
      "FAQ",
    ];
    for (const label of topLevelLabels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  test("overview link points to /docs", () => {
    currentPathname = "/docs";
    render(<DocsSidebar />);
    const overviewLinks = screen.getAllByRole("link", { name: "Overview" });
    expect(overviewLinks[0]).toHaveAttribute("href", "/docs");
  });

  test("highlights active link matching current pathname", () => {
    currentPathname = "/docs/authentication";
    render(<DocsSidebar />);

    // The active parent link should have emerald styling
    const authLinks = screen.getAllByRole("link", { name: "Authentication" });
    const activeLink = authLinks.find((el) =>
      el.className.includes("emerald") || el.getAttribute("aria-current") === "page",
    );
    expect(activeLink).not.toBeUndefined();
  });

  test("renders mobile menu toggle button", () => {
    currentPathname = "/docs";
    render(<DocsSidebar />);
    expect(screen.getByRole("button", { name: /open documentation navigation/i })).toBeInTheDocument();
  });
});

// ── GettingStartedPage ────────────────────────────────────────────────────────

describe("GettingStartedPage", () => {
  test("renders the page heading", () => {
    render(<GettingStartedPage />);
    expect(screen.getByRole("heading", { name: /getting started/i, level: 1 })).toBeInTheDocument();
  });

  test("renders Quick Start section heading", () => {
    render(<GettingStartedPage />);
    expect(screen.getByRole("heading", { name: /quick start/i })).toBeInTheDocument();
  });

  test("renders Registration section heading", () => {
    render(<GettingStartedPage />);
    expect(screen.getByRole("heading", { name: /registration/i })).toBeInTheDocument();
  });

  test("renders First Upload section heading", () => {
    render(<GettingStartedPage />);
    expect(screen.getByRole("heading", { name: /first upload/i })).toBeInTheDocument();
  });

  test("renders API Key Management section heading", () => {
    render(<GettingStartedPage />);
    expect(screen.getByRole("heading", { name: /api key/i })).toBeInTheDocument();
  });

  test("renders all three Quick Start steps", () => {
    render(<GettingStartedPage />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("shows a warning callout about API key visibility", () => {
    render(<GettingStartedPage />);
    expect(screen.getByText(/api key visibility/i)).toBeInTheDocument();
  });
});
