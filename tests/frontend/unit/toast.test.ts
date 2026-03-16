import hotToast from "react-hot-toast";

import { toast } from "@/lib/toast";

jest.mock("react-hot-toast", () => {
  const callable = jest.fn();
  return {
    __esModule: true,
    default: Object.assign(callable, {
      success: jest.fn(),
      error: jest.fn(),
    }),
  };
});

describe("toast helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("success uses standard duration", () => {
    toast.success("ok");
    expect(hotToast.success).toHaveBeenCalledWith("ok", { duration: 3000 });
  });

  test("error uses persistent duration", () => {
    toast.error("fail");
    expect(hotToast.error).toHaveBeenCalledWith("fail", { duration: Infinity });
  });

  test("warning uses warning icon and style", () => {
    toast.warning("careful");
    expect(hotToast).toHaveBeenCalledWith(
      "careful",
      expect.objectContaining({
        duration: 5000,
        icon: "⚠",
      }),
    );
  });

  test("info uses info icon and style", () => {
    toast.info("heads up");
    expect(hotToast).toHaveBeenCalledWith(
      "heads up",
      expect.objectContaining({
        duration: 3000,
        icon: "ℹ",
      }),
    );
  });
});
