"use client";

import {
  CheckCircle2,
  CircleAlert,
  FilePlus2,
  Inbox,
  LoaderCircle,
  PencilLine,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { AppShell } from "./AppShell";
import {
  calculateProfileCosts,
  createEmptyProfileInput,
  PROFILE_STATUSES,
  profileService,
  RECEIVING_AGENCIES,
  SERVICE_TYPES,
  type ProfileInput,
  type ProfileRecord,
  VEHICLE_TYPES,
} from "../lib/profiles";

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const TitleBlock = styled.div`
  h1 {
    margin: 0;
    color: var(--ink);
    font-size: clamp(22px, 2.7vw, 30px);
    letter-spacing: -0.045em;
    line-height: 1.05;
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 13px;
  background: var(--primary);
  padding: 0 18px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(56, 89, 217, 0.22);
  cursor: pointer;
  transition: 150ms ease;

  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const MonthTabs = styled.div`
  position: relative;
  display: flex;
  width: fit-content;
  max-width: 100%;
  justify-content: flex-start;
  gap: 6px;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  padding: 6px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ActiveMonthPill = styled.span<{ $left: number; $width: number; $visible: boolean }>`
  position: absolute;
  top: 6px;
  left: 0;
  width: ${({ $width }) => `${$width}px`};
  height: 44px;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 7px 18px rgba(56, 89, 217, 0.24);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: none;
  transform: translateX(${({ $left }) => `${$left}px`});
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    width 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 120ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const MonthTab = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  min-height: 44px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0 18px;
  color: ${({ $active }) => ($active ? "white" : "#687086")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease;

  &:hover {
    background: transparent;
    color: ${({ $active }) => ($active ? "white" : "var(--ink)")};
  }
`;

const Panel = styled.section`
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow);
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--line);
  padding: 17px 20px;

  h2 {
    margin: 0;
    color: var(--ink);
    font-size: 15px;
  }

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;

    ${PrimaryButton} {
      width: 100%;
    }
  }
`;

const SearchBox = styled.label`
  position: relative;
  display: block;
  width: min(300px, 100%);

  svg {
    position: absolute;
    top: 50%;
    left: 13px;
    color: #8a91a3;
    transform: translateY(-50%);
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 42px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: #fafbfc;
    padding: 0 13px 0 40px;
    color: var(--ink);
    font-size: 13px;

    &::placeholder {
      color: #9aa0af;
    }

    &:focus {
      border-color: rgba(56, 89, 217, 0.55);
      background: white;
    }
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 1240px;
  border-collapse: collapse;

  th {
    background: #fafbfc;
    padding: 13px 20px;
    color: #7d8496;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.07em;
    text-align: left;
    text-transform: uppercase;
  }

  td {
    border-top: 1px solid #eff0f4;
    padding: 16px 20px;
    color: #4c5569;
    font-size: 13px;
    vertical-align: middle;
  }

  tbody tr {
    transition: background 120ms ease;

    &:hover {
      background: #fbfcff;
    }
  }
`;

const PersonCell = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  color: var(--ink);
  font-weight: 650;

  > span {
    display: grid;
    width: 34px;
    height: 34px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 11px;
    background: #edf0ff;
    color: var(--primary);
  }
`;

const StatusPill = styled.span<{ $status: string }>`
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "Hoàn tất" ? "#e9f8ef" : $status === "Đã thanh toán" ? "#edf0ff" : "#fff5df"};
  padding: 0 10px;
  color: ${({ $status }) =>
    $status === "Hoàn tất" ? "#217448" : $status === "Đã thanh toán" ? "var(--primary)" : "#946516"};
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
`;

const ActionGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 7px;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  display: inline-grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid ${({ $danger }) => ($danger ? "#f4d9de" : "var(--line)")};
  border-radius: 10px;
  background: ${({ $danger }) => ($danger ? "#fff8f9" : "white")};
  color: ${({ $danger }) => ($danger ? "var(--danger)" : "#657087")};
  cursor: pointer;
  transition: 140ms ease;

  &:hover:not(:disabled) {
    border-color: ${({ $danger }) => ($danger ? "#e9aab6" : "#cfd4e3")};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.45;
  }
`;

const StateBox = styled.div`
  display: grid;
  min-height: 280px;
  place-items: center;
  padding: 42px 24px;
  color: var(--muted);
  text-align: center;

  svg {
    margin-bottom: 12px;
    color: #9ca6c2;
  }

  h3 {
    margin: 0 0 7px;
    color: var(--ink);
    font-size: 16px;
  }

  p {
    max-width: 360px;
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
  }
`;

const Toast = styled.div<{ $error: boolean }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  display: flex;
  max-width: min(390px, calc(100vw - 28px));
  align-items: center;
  gap: 10px;
  border: 1px solid ${({ $error }) => ($error ? "#f2cbd2" : "#cce8d8")};
  border-radius: 14px;
  background: white;
  padding: 13px 16px;
  color: ${({ $error }) => ($error ? "#a9293f" : "#27724a")};
  box-shadow: 0 18px 48px rgba(27, 35, 64, 0.16);
  font-size: 13px;
  font-weight: 650;

  @media (max-width: 520px) {
    right: 14px;
    bottom: 14px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: rgba(17, 24, 43, 0.5);
  padding: 24px;
  backdrop-filter: blur(5px);

  @media (max-width: 520px) {
    align-items: end;
    padding: 0;
  }
`;

const Modal = styled.div`
  display: flex;
  width: min(1240px, 100%);
  max-height: calc(100vh - 48px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  background: white;
  box-shadow: 0 30px 90px rgba(14, 22, 45, 0.28);

  @media (max-width: 520px) {
    border-radius: 22px 22px 0 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--line);
  padding: 22px 24px 18px;
  flex: 0 0 auto;

  h2 {
    margin: 0 0 5px;
    color: var(--ink);
    font-size: 20px;
    letter-spacing: -0.025em;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
  }
`;

const CloseButton = styled.button`
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: white;
  color: #697185;
  cursor: pointer;
`;

const Form = styled.form`
  overflow-y: auto;
  padding: 22px 24px 24px;
`;

const FormSections = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.section`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--line);
  border-radius: 17px;
  background: #fcfcfe;
  padding: 18px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 2px;
  color: var(--ink);
  font-size: 16px;
  letter-spacing: -0.015em;
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  color: #3d465b;
  font-size: 13px;
  font-weight: 680;

  input,
  select {
    width: 100%;
    height: 48px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: #fbfbfd;
    padding: 0 14px;
    color: var(--ink);
    font-size: 14px;
    font-weight: 500;
    transition: 130ms ease;

    &:focus {
      border-color: rgba(56, 89, 217, 0.6);
      background: white;
      box-shadow: 0 0 0 4px rgba(56, 89, 217, 0.08);
      outline: none;
    }

    &:disabled {
      color: #7d8496;
      cursor: not-allowed;
    }
  }
`;

const CheckGroup = styled.div`
  display: flex;
  min-height: 48px;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 18px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fbfbfd;
  padding: 10px 14px;

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #505a70;
    font-size: 13px;
    font-weight: 620;
    cursor: pointer;
  }

  input {
    width: 17px;
    height: 17px;
    accent-color: var(--primary);
  }
`;

const CostSummary = styled.div`
  display: block;
  margin-top: auto;
  border: 1px solid #dfe4f8;
  border-radius: 14px;
  background: #f7f8ff;
  padding: 15px;

  span {
    display: block;
    margin-bottom: 4px;
    color: var(--muted);
    font-size: 12px;
  }

  strong {
    color: var(--ink);
    font-size: 18px;
  }

`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 26px;
`;

const SecondaryButton = styled.button`
  min-height: 46px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: white;
  padding: 0 17px;
  color: #596276;
  font-size: 14px;
  font-weight: 680;
  cursor: pointer;
`;

type EditorState = { mode: "create"; profile?: undefined } | { mode: "edit"; profile: ProfileRecord };

function profileToInput(profile: ProfileRecord): ProfileInput {
  return {
    customerName: profile.customerName,
    vehicleOwnerName: profile.vehicleOwnerName,
    vehiclePlate: profile.vehiclePlate,
    vehicleType: profile.vehicleType,
    receivingAgency: profile.receivingAgency,
    serviceType: profile.serviceType,
    cost: profile.cost,
    registrationFeeCost: profile.registrationFeeCost,
    otherCost: profile.otherCost,
    blackBoxBadgeCost: profile.blackBoxBadgeCost,
    otherIncidentalCost: profile.otherIncidentalCost,
    initialCost: profile.initialCost,
    status: profile.status,
    newVehiclePlate: profile.newVehiclePlate,
    owesVehiclePlate: profile.owesVehiclePlate,
    owesRegistration: profile.owesRegistration,
  };
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}

function formatCurrentTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value || 0)} đ`;
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function getYearEndMonths() {
  const current = new Date();
  return [8, 9, 10, 11, 12].map((month) => {
    const date = new Date(current.getFullYear(), month - 1, 1);
    return {
      key: monthKey(date),
      label: `Tháng ${month}`,
      year: date.getFullYear(),
    };
  });
}

function MoneyField({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field>
      {label}
      <input
        type="number"
        min="0"
        step="1000"
        inputMode="numeric"
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        placeholder="0"
      />
    </Field>
  );
}

function ProfileModal({ state, saving, onClose, onSave }: {
  state: EditorState;
  saving: boolean;
  onClose: () => void;
  onSave: (input: ProfileInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProfileInput>(() =>
    state.profile ? profileToInput(state.profile) : createEmptyProfileInput(),
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const { totalCost, profit } = calculateProfileCosts(form);

  function updateField<Key extends keyof ProfileInput>(key: Key, value: ProfileInput[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentTime(new Date()), 1000);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearInterval(clock);
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, saving]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave({
      ...form,
      customerName: form.customerName.trim(),
      vehicleOwnerName: form.vehicleOwnerName.trim(),
      vehiclePlate: form.vehiclePlate.trim(),
      newVehiclePlate: form.newVehiclePlate.trim(),
    });
  }

  return (
    <Overlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <ModalHeader>
          <div>
            <h2 id="profile-modal-title">{state.mode === "create" ? "Thêm hồ sơ mới" : "Chỉnh sửa hồ sơ"}</h2>
            <p>Thời gian hiện tại: {formatCurrentTime(currentTime)}</p>
          </div>
          <CloseButton type="button" onClick={onClose} disabled={saving} aria-label="Đóng cửa sổ">
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={submit}>
          <FormSections>
            <FormSection>
              <SectionTitle>Thông tin khách</SectionTitle>

              <Field>
                Tên khách hàng
                <input
                  autoFocus
                  required
                  maxLength={120}
                  value={form.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                />
              </Field>

              <Field>
                Tên chủ phương tiện
                <input
                  required
                  maxLength={120}
                  value={form.vehicleOwnerName}
                  onChange={(event) => updateField("vehicleOwnerName", event.target.value)}
                  placeholder="Ví dụ: Trần Minh Bình"
                />
              </Field>

              <Field>
                Biển số xe
                <input
                  required
                  maxLength={30}
                  value={form.vehiclePlate}
                  onChange={(event) => updateField("vehiclePlate", event.target.value)}
                  placeholder="Ví dụ: 61A-123.45"
                />
              </Field>

              <Field>
                Loại xe
                <select required value={form.vehicleType} onChange={(event) => updateField("vehicleType", event.target.value)}>
                  <option value="" disabled>Chọn loại xe</option>
                  {VEHICLE_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>

              <Field>
                Cơ quan nhận
                <select required value={form.receivingAgency} onChange={(event) => updateField("receivingAgency", event.target.value)}>
                  <option value="" disabled>Chọn cơ quan nhận</option>
                  {RECEIVING_AGENCIES.map((agency) => <option key={agency}>{agency}</option>)}
                </select>
              </Field>

              <Field>
                Loại dịch vụ
                <select required value={form.serviceType} onChange={(event) => updateField("serviceType", event.target.value)}>
                  <option value="" disabled>Chọn loại dịch vụ</option>
                  {SERVICE_TYPES.map((service) => <option key={service}>{service}</option>)}
                </select>
              </Field>
            </FormSection>

            <FormSection>
              <SectionTitle>Chi phí</SectionTitle>

              <MoneyField label="Chi phí" value={form.cost} onChange={(value) => updateField("cost", value)} />
              <MoneyField label="Chi phí LPTB" value={form.registrationFeeCost} onChange={(value) => updateField("registrationFeeCost", value)} />
              <MoneyField label="Chi phí khác" value={form.otherCost} onChange={(value) => updateField("otherCost", value)} />
              <MoneyField label="Phát sinh Hộp đen, Phù hiệu" value={form.blackBoxBadgeCost} onChange={(value) => updateField("blackBoxBadgeCost", value)} />
              <MoneyField label="Phát sinh khác" value={form.otherIncidentalCost} onChange={(value) => updateField("otherIncidentalCost", value)} />

              <CostSummary>
                <span>Tổng chi phí</span>
                <strong>{formatCurrency(totalCost)}</strong>
              </CostSummary>
            </FormSection>

            <FormSection>
              <SectionTitle>Tiến trình hồ sơ</SectionTitle>

              <MoneyField label="Chi phí ban đầu" value={form.initialCost} onChange={(value) => updateField("initialCost", value)} />

              <Field>
                Trạng thái
                <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                  {PROFILE_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </Field>

              <Field as="div">
                Theo dõi giấy tờ
                <CheckGroup>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.owesVehiclePlate}
                      onChange={(event) => updateField("owesVehiclePlate", event.target.checked)}
                    />
                    Nợ biển số
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.owesRegistration}
                      onChange={(event) => updateField("owesRegistration", event.target.checked)}
                    />
                    Nợ giấy đăng kí
                  </label>
                </CheckGroup>
              </Field>

              <Field>
                Biển số xe mới
                <input
                  maxLength={30}
                  value={form.newVehiclePlate}
                  onChange={(event) => updateField("newVehiclePlate", event.target.value)}
                  placeholder="Nhập khi đã có biển số mới"
                />
              </Field>

              <CostSummary>
                <span>Lợi nhuận</span>
                <strong>{formatCurrency(profit)}</strong>
              </CostSummary>
            </FormSection>
          </FormSections>

          <FormActions>
            <SecondaryButton type="button" onClick={onClose} disabled={saving}>Huỷ</SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={
                saving ||
                !form.customerName.trim() ||
                !form.vehicleOwnerName.trim() ||
                !form.vehiclePlate.trim() ||
                !form.vehicleType ||
                !form.receivingAgency ||
                !form.serviceType
              }
            >
              {saving ? <LoaderCircle className="spin" size={17} /> : <CheckCircle2 size={17} />}
              {saving ? "Đang lưu..." : "Lưu hồ sơ"}
            </PrimaryButton>
          </FormActions>
        </Form>
      </Modal>
    </Overlay>
  );
}

export function ProfileManager() {
  const monthTabs = useMemo(() => getYearEndMonths(), []);
  const monthTabsRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    const initialMonth = currentMonth >= 8 && currentMonth <= 12 ? currentMonth : 8;
    return `${current.getFullYear()}-${String(initialMonth).padStart(2, "0")}`;
  });
  const [activePill, setActivePill] = useState({ left: 0, width: 0, visible: false });
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      setProfiles(await profileService.list());
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Không thể tải danh sách hồ sơ.", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfiles(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfiles]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useLayoutEffect(() => {
    const container = monthTabsRef.current;
    if (!container) return;

    const updatePill = () => {
      const activeTab = container.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');
      if (!activeTab) return;
      setActivePill({ left: activeTab.offsetLeft, width: activeTab.offsetWidth, visible: true });
    };

    updatePill();
    const observer = new ResizeObserver(updatePill);
    observer.observe(container);
    return () => observer.disconnect();
  }, [selectedMonth]);

  const visibleProfiles = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return profiles.filter((profile) => {
      const createdAt = new Date(profile.createdAt);
      if (Number.isNaN(createdAt.getTime()) || monthKey(createdAt) !== selectedMonth) return false;
      if (!normalizedQuery) return true;
      return normalize([
        profile.customerName,
        profile.vehicleOwnerName,
        profile.vehiclePlate,
        profile.newVehiclePlate,
        profile.receivingAgency,
        profile.serviceType,
      ].join(" ")).includes(normalizedQuery);
    });
  }, [profiles, query, selectedMonth]);

  async function saveProfile(input: ProfileInput) {
    if (!editor) return;
    setSaving(true);
    try {
      if (editor.mode === "create") {
        const created = await profileService.create(input);
        setProfiles((current) => [created, ...current]);
        setToast({ message: "Đã thêm hồ sơ mới.", error: false });
      } else {
        const updated = await profileService.update(editor.profile.id, input);
        setProfiles((current) => current.map((profile) => (profile.id === updated.id ? updated : profile)));
        setToast({ message: "Đã cập nhật hồ sơ.", error: false });
      }
      setEditor(null);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Không thể lưu hồ sơ.", error: true });
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(profile: ProfileRecord) {
    const confirmed = window.confirm(`Xoá hồ sơ của “${profile.customerName}”? Dữ liệu trong Google Sheets cũng sẽ bị xoá.`);
    if (!confirmed) return;

    setDeletingId(profile.id);
    try {
      await profileService.remove(profile.id);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      setToast({ message: "Đã xoá hồ sơ.", error: false });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Không thể xoá hồ sơ.", error: true });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell>
      <Header>
        <TitleBlock>
          <h1>Danh sách hồ sơ xe 2026</h1>
        </TitleBlock>
        <MonthTabs ref={monthTabsRef} role="tablist" aria-label="Lọc hồ sơ theo tháng">
          <ActiveMonthPill
            aria-hidden="true"
            $left={activePill.left}
            $width={activePill.width}
            $visible={activePill.visible}
          />
          {monthTabs.map((month) => (
            <MonthTab
              key={month.key}
              type="button"
              role="tab"
              $active={selectedMonth === month.key}
              aria-selected={selectedMonth === month.key}
              aria-label={`${month.label} năm ${month.year}`}
              onClick={() => setSelectedMonth(month.key)}
            >
              {month.label}
            </MonthTab>
          ))}
        </MonthTabs>
      </Header>

      <Panel>
        <Toolbar>
          <SearchBox>
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, biển số..."
              aria-label="Tìm hồ sơ theo tên hoặc biển số"
            />
          </SearchBox>
          <PrimaryButton type="button" onClick={() => setEditor({ mode: "create" })}>
            <FilePlus2 size={18} />
            Thêm hồ sơ
          </PrimaryButton>
        </Toolbar>

        {loading ? (
          <StateBox><div><LoaderCircle className="spin" size={30} /><h3>Đang tải hồ sơ</h3><p>Vui lòng chờ trong giây lát.</p></div></StateBox>
        ) : visibleProfiles.length === 0 ? (
          <StateBox>
            <div><Inbox size={34} /><h3>{query ? "Không tìm thấy kết quả" : "Chưa có hồ sơ trong tháng này"}</h3><p>{query ? "Hãy thử tìm bằng một tên khác." : "Bấm “Thêm hồ sơ” để tạo bản ghi đầu tiên."}</p></div>
          </StateBox>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Tên khách hàng</th>
                  <th>Tên chủ phương tiện</th>
                  <th>Biển số xe</th>
                  <th>Loại dịch vụ</th>
                  <th>Cơ quan nhận</th>
                  <th>Trạng thái</th>
                  <th>Tổng chi phí</th>
                  <th>Lợi nhuận</th>
                  <th>Cập nhật</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {visibleProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td><PersonCell><span><UserRound size={16} /></span>{profile.customerName}</PersonCell></td>
                    <td>{profile.vehicleOwnerName}</td>
                    <td>{profile.vehiclePlate || "—"}</td>
                    <td>{profile.serviceType || "—"}</td>
                    <td>{profile.receivingAgency || "—"}</td>
                    <td><StatusPill $status={profile.status}>{profile.status || "Đang xử lí"}</StatusPill></td>
                    <td>{formatCurrency(profile.totalCost)}</td>
                    <td>{formatCurrency(profile.profit)}</td>
                    <td>{formatDate(profile.updatedAt)}</td>
                    <td>
                      <ActionGroup>
                        <IconButton type="button" onClick={() => setEditor({ mode: "edit", profile })} aria-label={`Sửa hồ sơ ${profile.customerName}`} title="Sửa hồ sơ">
                          <PencilLine size={16} />
                        </IconButton>
                        <IconButton $danger type="button" disabled={deletingId === profile.id} onClick={() => void deleteProfile(profile)} aria-label={`Xoá hồ sơ ${profile.customerName}`} title="Xoá hồ sơ">
                          {deletingId === profile.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
                        </IconButton>
                      </ActionGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Panel>

      {editor && <ProfileModal state={editor} saving={saving} onClose={() => setEditor(null)} onSave={saveProfile} />}
      {toast && <Toast $error={toast.error}>{toast.error ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}{toast.message}</Toast>}
    </AppShell>
  );
}
