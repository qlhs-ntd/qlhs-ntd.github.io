export type ProfileRecord = {
  id: string;
  customerName: string;
  vehicleOwnerName: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = Pick<ProfileRecord, "customerName" | "vehicleOwnerName">;

type ScriptResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL?.trim();

let demoProfiles: ProfileRecord[] = [
  {
    id: "demo-001",
    customerName: "Nguyễn Minh Anh",
    vehicleOwnerName: "Nguyễn Văn Bình",
    createdAt: "2026-07-18T09:30:00.000Z",
    updatedAt: "2026-07-18T09:30:00.000Z",
  },
  {
    id: "demo-002",
    customerName: "Trần Hoàng Nam",
    vehicleOwnerName: "Trần Hoàng Nam",
    createdAt: "2026-07-20T04:15:00.000Z",
    updatedAt: "2026-07-22T08:10:00.000Z",
  },
];

async function requestScript<T>(action: string, payload?: Record<string, unknown>) {
  if (!scriptUrl) {
    throw new Error("Google Apps Script chưa được cấu hình.");
  }

  const response = payload
    ? await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, ...payload }),
        redirect: "follow",
      })
    : await fetch(`${scriptUrl}?action=${encodeURIComponent(action)}&t=${Date.now()}`, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
      });

  if (!response.ok) {
    throw new Error(`Không thể kết nối Google Sheets (${response.status}).`);
  }

  const result = (await response.json()) as ScriptResponse<T>;
  if (!result.success) {
    throw new Error(result.message || "Google Apps Script trả về lỗi.");
  }

  return result.data as T;
}

function now() {
  return new Date().toISOString();
}

export const isGoogleSheetsConnected = Boolean(scriptUrl);

export const profileService = {
  async list(): Promise<ProfileRecord[]> {
    if (scriptUrl) return requestScript<ProfileRecord[]>("list");
    return [...demoProfiles];
  },

  async create(input: ProfileInput): Promise<ProfileRecord> {
    if (scriptUrl) return requestScript<ProfileRecord>("create", { record: input });

    const timestamp = now();
    const profile: ProfileRecord = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    demoProfiles = [profile, ...demoProfiles];
    return profile;
  },

  async update(id: string, input: ProfileInput): Promise<ProfileRecord> {
    if (scriptUrl) return requestScript<ProfileRecord>("update", { id, record: input });

    const existing = demoProfiles.find((profile) => profile.id === id);
    if (!existing) throw new Error("Không tìm thấy hồ sơ cần cập nhật.");
    const updated = { ...existing, ...input, updatedAt: now() };
    demoProfiles = demoProfiles.map((profile) => (profile.id === id ? updated : profile));
    return updated;
  },

  async remove(id: string): Promise<void> {
    if (scriptUrl) {
      await requestScript<{ id: string }>("delete", { id });
      return;
    }
    demoProfiles = demoProfiles.filter((profile) => profile.id !== id);
  },
};

