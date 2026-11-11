export function importDocumentFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["txt", "html", "htm"].includes(extension ?? "")) {
      reject(new Error("Please select a .txt or .html file."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = String(reader.result ?? "");

      if (extension === "txt") {
        const escaped = content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        resolve(
          escaped
            .split(/\r?\n/)
            .map((line) => `<p>${line || "<br>"}</p>`)
            .join(""),
        );
      } else {
        resolve(content);
      }
    };

    reader.onerror = () => reject(new Error("Could not read this file."));

    reader.readAsText(file);
  });
}

export function exportDocumentFile(
  title: string,
  content: string,
  format: "html" | "txt",
) {
  const safeTitle =
    title.replace(/[<>:"/\\|?*]/g, "-").trim() || "document";

  let output = content;
  let mimeType = "text/html";

  if (format === "txt") {
    const parser = new DOMParser();
    const document = parser.parseFromString(content, "text/html");

    output = document.body.textContent ?? "";
    mimeType = "text/plain";
  }

  const blob = new Blob([output], {
    type: `${mimeType};charset=utf-8`,
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeTitle}.${format}`;
  link.click();

  URL.revokeObjectURL(url);
}
