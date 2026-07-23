const SPREADSHEET_ID = "19dqKPEW439W6R1FvjQNte54yV5wwZQ7LJqHxf30vGFc";
const SHEET_NAME = "HoSo";
const HEADERS = [
  "ID",
  "Tên Khách Hàng",
  "Tên Chủ Phương Tiện",
  "Ngày Tạo",
  "Cập Nhật Lúc",
  "Biển Số Xe",
  "Loại Xe",
  "Cơ Quan Nhận",
  "Loại Dịch Vụ",
  "Chi Phí",
  "Chi Phí LPTB",
  "Chi Phí Khác",
  "Phát Sinh Hộp Đen, Phù Hiệu",
  "Phát Sinh Khác",
  "Chi Phí Ban Đầu",
  "Trạng Thái",
  "Biển Số Xe Mới",
  "Nợ Biển Số",
  "Nợ Giấy Đăng Kí",
  "Tổng Chi Phí",
  "Lợi Nhuận",
];

const VEHICLE_TYPES = [
  "Ô tô con",
  "Đầu kéo",
  "Tải có mui",
  "SMRM",
  "Xe máy chuyên dùng",
  "Xe máy",
  "Tải tự đổ",
];

const RECEIVING_AGENCIES = [
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
];

const SERVICE_TYPES = [
  "Thu hồi",
  "Đăng ký sang tên",
  "Thu hồi và sang tên",
  "Phạt nguội",
  "Cấp lại",
  "Cấp đổi",
  "Đăng ký lần đầu",
  "Cấp đổi và cải tạo",
];

const PROFILE_STATUSES = ["Đang xử lí", "Đã thanh toán", "Hoàn tất"];

function doGet(event) {
  try {
    const action = String((event && event.parameter && event.parameter.action) || "list");
    if (action !== "list") {
      return jsonResponse({ success: false, message: "Hành động không hợp lệ." });
    }

    return jsonResponse({ success: true, data: listProfiles() });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  }
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const body = JSON.parse((event && event.postData && event.postData.contents) || "{}");
    let data;

    switch (body.action) {
      case "create":
        data = createProfile(body.record || {});
        break;
      case "update":
        data = updateProfile(String(body.id || ""), body.record || {});
        break;
      case "delete":
        data = deleteProfile(String(body.id || ""));
        break;
      default:
        throw new Error("Hành động không hợp lệ.");
    }

    SpreadsheetApp.flush();
    return jsonResponse({ success: true, data: data });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#3859d9")
    .setFontColor("#ffffff");
  sheet.setFrozenRows(1);

  return sheet;
}

function listProfiles() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return rows
    .filter(function (row) { return String(row[0]).trim() !== ""; })
    .map(rowToProfile)
    .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
}

function createProfile(record) {
  const clean = validateRecord(record);
  const sheet = getSheet();
  const now = new Date();
  const profile = buildProfile(Utilities.getUuid(), clean, now, now);

  sheet.appendRow(profileToRow(profile));
  return profile;
}

function updateProfile(id, record) {
  if (!id) throw new Error("Thiếu ID hồ sơ.");
  const clean = validateRecord(record);
  const sheet = getSheet();
  const rowNumber = findRowById(sheet, id);
  if (rowNumber === -1) throw new Error("Không tìm thấy hồ sơ cần cập nhật.");

  const createdAt = sheet.getRange(rowNumber, 4).getValue() || new Date();
  const profile = buildProfile(id, clean, createdAt, new Date());
  sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([profileToRow(profile)]);
  return profile;
}

function deleteProfile(id) {
  if (!id) throw new Error("Thiếu ID hồ sơ.");
  const sheet = getSheet();
  const rowNumber = findRowById(sheet, id);
  if (rowNumber === -1) throw new Error("Không tìm thấy hồ sơ cần xoá.");

  sheet.deleteRow(rowNumber);
  return { id: id };
}

function findRowById(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (let index = 0; index < ids.length; index += 1) {
    if (String(ids[index][0]) === id) return index + 2;
  }
  return -1;
}

function validateRecord(record) {
  const customerName = cleanText(record.customerName);
  const vehicleOwnerName = cleanText(record.vehicleOwnerName);
  const vehiclePlate = cleanText(record.vehiclePlate);
  const vehicleType = cleanText(record.vehicleType);
  const receivingAgency = cleanText(record.receivingAgency);
  const serviceType = cleanText(record.serviceType);
  const status = cleanText(record.status) || PROFILE_STATUSES[0];

  if (!customerName) throw new Error("Tên khách hàng không được để trống.");
  if (!vehicleOwnerName) throw new Error("Tên chủ phương tiện không được để trống.");
  if (!vehiclePlate) throw new Error("Biển số xe không được để trống.");
  if (customerName.length > 120 || vehicleOwnerName.length > 120) {
    throw new Error("Tên không được dài quá 120 ký tự.");
  }
  if (VEHICLE_TYPES.indexOf(vehicleType) === -1) throw new Error("Loại xe không hợp lệ.");
  if (RECEIVING_AGENCIES.indexOf(receivingAgency) === -1) throw new Error("Cơ quan nhận không hợp lệ.");
  if (SERVICE_TYPES.indexOf(serviceType) === -1) throw new Error("Loại dịch vụ không hợp lệ.");
  if (PROFILE_STATUSES.indexOf(status) === -1) throw new Error("Trạng thái không hợp lệ.");

  const clean = {
    customerName: customerName,
    vehicleOwnerName: vehicleOwnerName,
    vehiclePlate: vehiclePlate,
    vehicleType: vehicleType,
    receivingAgency: receivingAgency,
    serviceType: serviceType,
    cost: toAmount(record.cost),
    registrationFeeCost: toAmount(record.registrationFeeCost),
    otherCost: toAmount(record.otherCost),
    blackBoxBadgeCost: toAmount(record.blackBoxBadgeCost),
    otherIncidentalCost: toAmount(record.otherIncidentalCost),
    initialCost: toAmount(record.initialCost),
    status: status,
    newVehiclePlate: cleanText(record.newVehiclePlate),
    owesVehiclePlate: toBoolean(record.owesVehiclePlate),
    owesRegistration: toBoolean(record.owesRegistration),
  };

  clean.totalCost = clean.cost + clean.registrationFeeCost + clean.otherCost + clean.blackBoxBadgeCost + clean.otherIncidentalCost;
  clean.profit = clean.totalCost - clean.initialCost;
  return clean;
}

function buildProfile(id, clean, createdAt, updatedAt) {
  return {
    id: id,
    customerName: clean.customerName,
    vehicleOwnerName: clean.vehicleOwnerName,
    vehiclePlate: clean.vehiclePlate,
    vehicleType: clean.vehicleType,
    receivingAgency: clean.receivingAgency,
    serviceType: clean.serviceType,
    cost: clean.cost,
    registrationFeeCost: clean.registrationFeeCost,
    otherCost: clean.otherCost,
    blackBoxBadgeCost: clean.blackBoxBadgeCost,
    otherIncidentalCost: clean.otherIncidentalCost,
    initialCost: clean.initialCost,
    status: clean.status,
    newVehiclePlate: clean.newVehiclePlate,
    owesVehiclePlate: clean.owesVehiclePlate,
    owesRegistration: clean.owesRegistration,
    totalCost: clean.totalCost,
    profit: clean.profit,
    createdAt: toIsoString(createdAt),
    updatedAt: toIsoString(updatedAt),
  };
}

function profileToRow(profile) {
  return [
    profile.id,
    profile.customerName,
    profile.vehicleOwnerName,
    new Date(profile.createdAt),
    new Date(profile.updatedAt),
    profile.vehiclePlate,
    profile.vehicleType,
    profile.receivingAgency,
    profile.serviceType,
    profile.cost,
    profile.registrationFeeCost,
    profile.otherCost,
    profile.blackBoxBadgeCost,
    profile.otherIncidentalCost,
    profile.initialCost,
    profile.status,
    profile.newVehiclePlate,
    profile.owesVehiclePlate,
    profile.owesRegistration,
    profile.totalCost,
    profile.profit,
  ];
}

function rowToProfile(row) {
  const input = {
    customerName: String(row[1] || ""),
    vehicleOwnerName: String(row[2] || ""),
    vehiclePlate: String(row[5] || ""),
    vehicleType: String(row[6] || ""),
    receivingAgency: String(row[7] || ""),
    serviceType: String(row[8] || ""),
    cost: toAmount(row[9]),
    registrationFeeCost: toAmount(row[10]),
    otherCost: toAmount(row[11]),
    blackBoxBadgeCost: toAmount(row[12]),
    otherIncidentalCost: toAmount(row[13]),
    initialCost: toAmount(row[14]),
    status: String(row[15] || PROFILE_STATUSES[0]),
    newVehiclePlate: String(row[16] || ""),
    owesVehiclePlate: toBoolean(row[17]),
    owesRegistration: toBoolean(row[18]),
  };
  const totalCost = input.cost + input.registrationFeeCost + input.otherCost + input.blackBoxBadgeCost + input.otherIncidentalCost;

  return {
    id: String(row[0]),
    customerName: input.customerName,
    vehicleOwnerName: input.vehicleOwnerName,
    vehiclePlate: input.vehiclePlate,
    vehicleType: input.vehicleType,
    receivingAgency: input.receivingAgency,
    serviceType: input.serviceType,
    cost: input.cost,
    registrationFeeCost: input.registrationFeeCost,
    otherCost: input.otherCost,
    blackBoxBadgeCost: input.blackBoxBadgeCost,
    otherIncidentalCost: input.otherIncidentalCost,
    initialCost: input.initialCost,
    status: input.status,
    newVehiclePlate: input.newVehiclePlate,
    owesVehiclePlate: input.owesVehiclePlate,
    owesRegistration: input.owesRegistration,
    totalCost: totalCost,
    profit: totalCost - input.initialCost,
    createdAt: toIsoString(row[3]),
    updatedAt: toIsoString(row[4]),
  };
}

function cleanText(value) {
  return String(value || "").trim();
}

function toAmount(value) {
  const amount = Number(value);
  return isFinite(amount) ? Math.max(0, amount) : 0;
}

function toBoolean(value) {
  return value === true || String(value).toLowerCase() === "true";
}

function toIsoString(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? "" : date.toISOString();
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
