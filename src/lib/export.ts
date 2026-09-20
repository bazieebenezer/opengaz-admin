import api from "@/lib/api";

export async function downloadCsv(url: string, filename: string) {
  const response = await api.get(url, { responseType: "text" });
  const blob = new Blob([response.data as string], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}