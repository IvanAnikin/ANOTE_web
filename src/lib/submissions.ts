import fs from "fs";
import path from "path";

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  practiceType: string;
  message: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "submissions.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, "[]", "utf-8");
  }
}

export function getSubmissions(): Submission[] {
  ensureFile();
  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  return JSON.parse(raw) as Submission[];
}

export function addSubmission(
  data: Omit<Submission, "id" | "timestamp">,
): Submission {
  const submissions = getSubmissions();
  const entry: Submission = {
    id: crypto.randomUUID(),
    ...data,
    timestamp: new Date().toISOString(),
  };
  submissions.push(entry);
  fs.writeFileSync(FILE_PATH, JSON.stringify(submissions, null, 2), "utf-8");
  return entry;
}

export function submissionsToCsv(submissions: Submission[]): string {
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "practiceType",
    "message",
    "timestamp",
  ];
  const escape = (v: string) =>
    `"${v.replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const rows = submissions.map((s) =>
    headers.map((h) => escape(String(s[h as keyof Submission] ?? ""))).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
