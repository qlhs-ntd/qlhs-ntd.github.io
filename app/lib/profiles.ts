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
  return {
    ...createEmptyProfileInput(),
    ...input,
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
    if (scriptUrl) {
      const records = await requestScript<ProfileRecord[]>("list");
      return records.map(normalizeRecord);
    }
    return [...demoProfiles];
  },

  async create(input: ProfileInput): Promise<ProfileRecord> {
    const cleanInput = normalizeInput(input);
    if (scriptUrl) {
      return normalizeRecord(await requestScript<ProfileRecord>("create", { record: cleanInput }));
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
    return profile;
  },

  async update(id: string, input: ProfileInput): Promise<ProfileRecord> {
    const cleanInput = normalizeInput(input);
    if (scriptUrl) {
      return normalizeRecord(await requestScript<ProfileRecord>("update", { id, record: cleanInput }));
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
