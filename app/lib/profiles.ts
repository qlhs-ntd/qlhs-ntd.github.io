export const VEHICLE_TYPES = [
  "Ô tô con",
  "Đầu kéo",
  "Tải có mui",
  "Sơ mi rơ mooc",
  "Xe máy chuyên dùng",
  "Xe máy",
  "Tải tự đổ",
] as const;

export const RECEIVING_AGENCIES = [
  "Bình Hòa",
  "Tân Đông Hiệp",
  "Tân Khánh",
  "Rạch Chiết",
  "Lái Thiêu",
  "Giao Thông Bắc Tân Uyên",
  "Giao Thông QL13",
  "An Phú",
  "Bình Cơ",
  "Giao Thông An Sương",
  "Hòa Lợi",
  "CSGT Đồng Nai",
  "CSGT Bắc Tân Uyên",
  "CSGT Quốc Lộ 13",
  "PC08",
  "Phòng CSGT Đồng Nai",
  "Thanh An",
  "Đông Hưng Thuận",
  "Dĩ An",
] as const;

export const SERVICE_TYPES = [
  "Thu hồi",
  "Đăng ký sang tên",
  "Thu hồi và sang tên",
  "Phạt nguội",
  "Cấp lại",
  "Cấp đổi",
  "Đăng ký lần đầu",
  "Cấp đổi và cải tạo",
] as const;

export const PROFILE_STATUSES = [
  "Đang xử lí",
  "Đang chờ thanh toán",
  "Đã thanh toán",
  "Hoàn tất",
] as const;

export type ProfileInput = {
  customerName: string;
  vehicleOwnerName: string;
  vehiclePlate: string;
  vehicleType: string;
  receivingAgency: string;
  serviceType: string;
  cost: number;
  registrationFeeCost: number;
  otherCost: number;
  blackBoxBadgeCost: number;
  otherIncidentalCost: number;
  initialCost: number;
  status: string;
  newVehiclePlate: string;
  owesVehiclePlate: boolean;
  owesRegistration: boolean;
};

export type ProfileRecord = ProfileInput & {
  id: string;
  totalCost: number;
  profit: number;
  createdAt: string;
  updatedAt: string;
};

type ScriptResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzv0TOLz1fiff42H4Rs2GGm3K7rcQTrzLhc994TUmI21aaCAzREVBLV1Ze2h21rDwdOyA/exec";

const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL?.trim() || DEFAULT_SCRIPT_URL;

export function createEmptyProfileInput(): ProfileInput {
  return {
    customerName: "",
    vehicleOwnerName: "",
    vehiclePlate: "",
    vehicleType: VEHICLE_TYPES[0],
    receivingAgency: RECEIVING_AGENCIES[0],
    serviceType: SERVICE_TYPES[0],
    cost: 0,
    registrationFeeCost: 0,
    otherCost: 0,
    blackBoxBadgeCost: 0,
    otherIncidentalCost: 0,
    initialCost: 0,
    status: PROFILE_STATUSES[0],
    newVehiclePlate: "",
    owesVehiclePlate: false,
    owesRegistration: false,
  };
}

export function calculateProfileCosts(input: ProfileInput) {
  const totalCost =
    toAmount(input.cost) +
    toAmount(input.registrationFeeCost) +
    toAmount(input.otherCost) +
    toAmount(input.blackBoxBadgeCost) +
    toAmount(input.otherIncidentalCost);

  return {
    totalCost,
    profit: totalCost - toAmount(input.initialCost),
  };
}

function toAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeInput(input: Partial<ProfileInput>): ProfileInput {
  const vehiclePlate = String(input.vehiclePlate || "").trim();

  return {
    ...createEmptyProfileInput(),
    ...input,
    vehiclePlate: vehiclePlate === "--" ? "" : vehiclePlate,
    vehicleType: input.vehicleType === "SMRM" ? "Sơ mi rơ mooc" : input.vehicleType || VEHICLE_TYPES[0],
    receivingAgency: input.receivingAgency || RECEIVING_AGENCIES[0],
    serviceType: input.serviceType || SERVICE_TYPES[0],
    status: input.status || PROFILE_STATUSES[0],
    cost: toAmount(input.cost),
    registrationFeeCost: toAmount(input.registrationFeeCost),
    otherCost: toAmount(input.otherCost),
    blackBoxBadgeCost: toAmount(input.blackBoxBadgeCost),
    otherIncidentalCost: toAmount(input.otherIncidentalCost),
    initialCost: toAmount(input.initialCost),
    owesVehiclePlate: input.owesVehiclePlate === true,
    owesRegistration: input.owesRegistration === true,
  };
}

function toScriptRecord(input: ProfileInput): ProfileInput {
  return {
    ...input,
    vehiclePlate: input.vehiclePlate.trim() || "--",
  };
}

function normalizeRecord(record: Partial<ProfileRecord>): ProfileRecord {
  const input = normalizeInput(record);
  const calculated = calculateProfileCosts(input);
  return {
    id: String(record.id || crypto.randomUUID()),
    ...input,
    totalCost: toAmount(record.totalCost) || calculated.totalCost,
    profit: Number.isFinite(Number(record.profit)) ? Number(record.profit) : calculated.profit,
    createdAt: String(record.createdAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || record.createdAt || new Date().toISOString()),
  };
}

let demoProfiles: ProfileRecord[] = [];
let profileCache: ProfileRecord[] | null = null;
let profileListRequest: Promise<ProfileRecord[]> | null = null;

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

async function loadProfilesOnce(): Promise<ProfileRecord[]> {
  if (profileCache) return [...profileCache];

  if (!profileListRequest) {
    profileListRequest = (async () => {
      const records = scriptUrl
        ? (await requestScript<ProfileRecord[]>("list")).map(normalizeRecord)
        : [...demoProfiles];
      profileCache = records;
      return records;
    })();
  }

  try {
    return [...(await profileListRequest)];
  } finally {
    profileListRequest = null;
  }
}

export const isGoogleSheetsConnected = Boolean(scriptUrl);

export const profileService = {
  async list(): Promise<ProfileRecord[]> {
    return loadProfilesOnce();
  },

  async refresh(): Promise<ProfileRecord[]> {
    profileCache = null;
    return loadProfilesOnce();
  },

  createOptimistic(input: ProfileInput): ProfileRecord {
    const cleanInput = normalizeInput(input);
    const timestamp = now();
    const profile = normalizeRecord({
      id: crypto.randomUUID(),
      ...cleanInput,
      ...calculateProfileCosts(cleanInput),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    profileCache = [profile, ...(profileCache ?? [])];
    if (!scriptUrl) demoProfiles = [profile, ...demoProfiles];
    return profile;
  },

  async syncCreate(temporaryId: string, input: ProfileInput): Promise<ProfileRecord> {
    if (!scriptUrl) {
      const created = profileCache?.find((profile) => profile.id === temporaryId);
      if (!created) throw new Error("Không tìm thấy hồ sơ cần lưu.");
      return created;
    }

    const cleanInput = normalizeInput(input);
    const created = normalizeRecord(await requestScript<ProfileRecord>("create", { record: toScriptRecord(cleanInput) }));
    profileCache = (profileCache ?? []).map((profile) => (profile.id === temporaryId ? created : profile));
    return created;
  },

  updateOptimistic(existing: ProfileRecord, input: ProfileInput): ProfileRecord {
    const cleanInput = normalizeInput(input);
    const updated = normalizeRecord({
      ...existing,
      ...cleanInput,
      ...calculateProfileCosts(cleanInput),
      updatedAt: now(),
    });
    profileCache = (profileCache ?? []).map((profile) => (profile.id === updated.id ? updated : profile));
    if (!scriptUrl) demoProfiles = demoProfiles.map((profile) => (profile.id === updated.id ? updated : profile));
    return updated;
  },

  async syncUpdate(id: string, input: ProfileInput): Promise<ProfileRecord> {
    if (!scriptUrl) {
      const updated = profileCache?.find((profile) => profile.id === id);
      if (!updated) throw new Error("Không tìm thấy hồ sơ cần cập nhật.");
      return updated;
    }

    const cleanInput = normalizeInput(input);
    const updated = normalizeRecord(await requestScript<ProfileRecord>("update", { id, record: toScriptRecord(cleanInput) }));
    profileCache = (profileCache ?? []).map((profile) => (profile.id === updated.id ? updated : profile));
    return updated;
  },

  removeOptimistic(profile: ProfileRecord): void {
    profileCache = (profileCache ?? []).filter((item) => item.id !== profile.id);
    if (!scriptUrl) demoProfiles = demoProfiles.filter((item) => item.id !== profile.id);
  },

  async syncRemove(id: string): Promise<void> {
    if (scriptUrl) await requestScript<{ id: string }>("delete", { id });
  },

  async create(input: ProfileInput): Promise<ProfileRecord> {
    const cleanInput = normalizeInput(input);
    if (scriptUrl) {
      const created = normalizeRecord(await requestScript<ProfileRecord>("create", { record: toScriptRecord(cleanInput) }));
      if (profileCache) profileCache = [created, ...profileCache];
      return created;
    }

    const timestamp = now();
    const profile = normalizeRecord({
      id: crypto.randomUUID(),
      ...cleanInput,
      ...calculateProfileCosts(cleanInput),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    demoProfiles = [profile, ...demoProfiles];
    if (profileCache) profileCache = [profile, ...profileCache];
    return profile;
  },

  async update(id: string, input: ProfileInput): Promise<ProfileRecord> {
    const cleanInput = normalizeInput(input);
    if (scriptUrl) {
      const updated = normalizeRecord(await requestScript<ProfileRecord>("update", { id, record: toScriptRecord(cleanInput) }));
      if (profileCache) profileCache = profileCache.map((profile) => (profile.id === updated.id ? updated : profile));
      return updated;
    }

    const existing = demoProfiles.find((profile) => profile.id === id);
    if (!existing) throw new Error("Không tìm thấy hồ sơ cần cập nhật.");
    const updated = normalizeRecord({
      ...existing,
      ...cleanInput,
      ...calculateProfileCosts(cleanInput),
      updatedAt: now(),
    });
    demoProfiles = demoProfiles.map((profile) => (profile.id === id ? updated : profile));
    if (profileCache) profileCache = profileCache.map((profile) => (profile.id === updated.id ? updated : profile));
    return updated;
  },

  async remove(id: string): Promise<void> {
    if (scriptUrl) {
      await requestScript<{ id: string }>("delete", { id });
      if (profileCache) profileCache = profileCache.filter((profile) => profile.id !== id);
      return;
    }
    demoProfiles = demoProfiles.filter((profile) => profile.id !== id);
    if (profileCache) profileCache = profileCache.filter((profile) => profile.id !== id);
  },
};
