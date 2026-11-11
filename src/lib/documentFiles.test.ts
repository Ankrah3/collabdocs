import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  importDocumentFile,
  exportDocumentFile,
} from "./documentFiles";

describe("Document file utilities", () => {
  it("imports a TXT file and converts its lines into paragraphs", async () => {
    const file = new File(
      ["Hello CollabDocs\nThis is a test."],
      "notes.txt",
      { type: "text/plain" },
    );

    const result = await importDocumentFile(file);

    expect(result).toBe(
      "<p>Hello CollabDocs</p><p>This is a test.</p>",
    );
  });

  it("escapes HTML characters in TXT files", async () => {
    const file = new File(
      ["<script>alert('test')</script>"],
      "notes.txt",
      { type: "text/plain" },
    );

    const result = await importDocumentFile(file);

    expect(result).toContain("&lt;script&gt;");
  });

  it("imports an HTML file without changing its content", async () => {
    const html = "<h1>My document</h1><p>Welcome!</p>";

    const file = new File([html], "document.html", {
      type: "text/html",
    });

    const result = await importDocumentFile(file);

    expect(result).toBe(html);
  });

  it("rejects unsupported file formats", async () => {
    const file = new File(["image"], "photo.png", {
      type: "image/png",
    });

    await expect(importDocumentFile(file)).rejects.toThrow(
      "Please select a .txt or .html file.",
    );
  });

  describe("exportDocumentFile", () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURL = vi.fn().mockReturnValue("blob:test");
      revokeObjectURL = vi.fn();

      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: createObjectURL,
      });

      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: revokeObjectURL,
      });

      vi.spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});
    });

    it("exports a document as HTML", () => {
      exportDocumentFile(
        "My Document",
        "<h1>Hello</h1>",
        "html",
      );

      expect(createObjectURL).toHaveBeenCalled();
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });

    it("exports a document as plain text", async () => {
      let exportedBlob: Blob | undefined;

      createObjectURL.mockImplementation((blob: Blob) => {
        exportedBlob = blob;
        return "blob:test";
      });

      exportDocumentFile(
        "My Document",
        "<h1>Hello</h1><p>CollabDocs</p>",
        "txt",
      );

      expect(exportedBlob).toBeDefined();
      expect(await exportedBlob!.text()).toBe("HelloCollabDocs");
    });
  });
});
