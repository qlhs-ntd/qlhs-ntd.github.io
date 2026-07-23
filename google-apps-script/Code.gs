const SHEET_NAME = "HoSo";
const HEADERS = [
  "ID",
  "Tên Khách Hàng",
  "Tên Chủ Phương Tiện",
  "Ngày Tạo",
  "Cập Nhật Lúc",
];

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
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#3859d9")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

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
  const id = Utilities.getUuid();

  sheet.appendRow([id, clean.customerName, clean.vehicleOwnerName, now, now]);
  return {
    id: id,
    customerName: clean.customerName,
    vehicleOwnerName: clean.vehicleOwnerName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function updateProfile(id, record) {
  if (!id) throw new Error("Thiếu ID hồ sơ.");
  const clean = validateRecord(record);
  const sheet = getSheet();
  const rowNumber = findRowById(sheet, id);
  if (rowNumber === -1) throw new Error("Không tìm thấy hồ sơ cần cập nhật.");

  const createdAt = sheet.getRange(rowNumber, 4).getValue() || new Date();
  const updatedAt = new Date();
  sheet.getRange(rowNumber, 2, 1, 4).setValues([[
    clean.customerName,
    clean.vehicleOwnerName,
    createdAt,
    updatedAt,
  ]]);

  return {
    id: id,
    customerName: clean.customerName,
    vehicleOwnerName: clean.vehicleOwnerName,
    createdAt: toIsoString(createdAt),
    updatedAt: updatedAt.toISOString(),
  };
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
  const customerName = String(record.customerName || "").trim();
  const vehicleOwnerName = String(record.vehicleOwnerName || "").trim();

  if (!customerName) throw new Error("Tên Khách Hàng không được để trống.");
  if (!vehicleOwnerName) throw new Error("Tên Chủ Phương Tiện không được để trống.");
  if (customerName.length > 120 || vehicleOwnerName.length > 120) {
    throw new Error("Tên không được dài quá 120 ký tự.");
  }

  return { customerName: customerName, vehicleOwnerName: vehicleOwnerName };
}

function rowToProfile(row) {
  return {
    id: String(row[0]),
    customerName: String(row[1] || ""),
    vehicleOwnerName: String(row[2] || ""),
    createdAt: toIsoString(row[3]),
    updatedAt: toIsoString(row[4]),
  };
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

