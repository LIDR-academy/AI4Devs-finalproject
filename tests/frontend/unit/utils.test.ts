import { cn } from "@/lib/utils";

describe("cn utility", () => {
  test("merges class names", () => {
    expect(cn("p-2", "text-sm")).toContain("p-2");
  });

  test("tailwind class conflict keeps latest value", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
