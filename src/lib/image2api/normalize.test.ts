import { describe, expect, it } from "vitest";

import { normalizeImageResponse } from "./normalize";

describe("normalizeImageResponse", () => {
  it("uses the backend message when a generation request fails", () => {
    const result = normalizeImageResponse({
      ok: false,
      code: "image_timeout",
      message: "图片生成超时，请稍后查看作品",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.error).toBe("图片生成超时，请稍后查看作品");
  });

  it("keeps every unique image URL returned by the sync generation API", () => {
    const result = normalizeImageResponse({
      ok: true,
      taskId: "img_multi",
      imageUrls: ["/p/img/img_multi/0", "/p/img/img_multi/1", "/p/img/img_multi/0"],
    });

    expect(result.status).toBe("completed");
    expect(result.imageUrls).toEqual(["/p/img/img_multi/0", "/p/img/img_multi/1"]);
  });
});
