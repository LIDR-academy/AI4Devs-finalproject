import { describe, expect, it } from "vitest";
import { validateAddItem } from "./add-item.schema";

describe("validateAddItem", () => {
  const valid = {
    name: "Greek Yogurt",
    quantity: 2,
    unit: "unit" as const,
  };

  it("accepts a valid payload and trims the name", () => {
    const result = validateAddItem({ ...valid, name: "  Greek Yogurt  " });
    expect(result.success).toBe(true);
    expect(result.values?.name).toBe("Greek Yogurt");
    expect(result.values?.quantity).toBe(2);
    expect(result.errors).toEqual({});
  });

  it("rejects an empty name with a field-level message", () => {
    const result = validateAddItem({ ...valid, name: "   " });
    expect(result.success).toBe(false);
    expect(result.errors.name).toBe("Name is required.");
  });

  it("rejects quantity below 1", () => {
    const result = validateAddItem({ ...valid, quantity: 0 });
    expect(result.success).toBe(false);
    expect(result.errors.quantity).toBe("Quantity must be at least 1.");
  });

  it("rejects a non-integer quantity", () => {
    const result = validateAddItem({ ...valid, quantity: 1.5 });
    expect(result.success).toBe(false);
    expect(result.errors.quantity).toBe("Quantity must be a whole number.");
  });

  it("rejects a negative price paid", () => {
    const result = validateAddItem({ ...valid, pricePaid: -3 });
    expect(result.success).toBe(false);
    expect(result.errors.pricePaid).toBe("Price must be 0 or more.");
  });

  it("treats optional price/expiration as omittable", () => {
    const result = validateAddItem(valid);
    expect(result.success).toBe(true);
    expect(result.values?.pricePaid).toBeUndefined();
    expect(result.values?.expirationDate).toBeUndefined();
  });

  it("reports only one error per field", () => {
    const result = validateAddItem({ name: "", quantity: -2, unit: "unit" });
    expect(Object.keys(result.errors)).toEqual(expect.arrayContaining(["name", "quantity"]));
    expect(typeof result.errors.name).toBe("string");
  });
});
