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
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { AppShell } from "./AppShell";
import {
  profileService,
  type ProfileInput,
  type ProfileRecord,
} from "../lib/profiles";

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const TitleBlock = styled.div`
  h1 {
    margin: 0 0 6px;
    color: var(--ink);
    font-size: clamp(28px, 4vw, 40px);
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
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
  min-width: 720px;
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
  width: min(520px, 100%);
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
  padding: 22px 24px 24px;
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
  color: #3d465b;
  font-size: 13px;
  font-weight: 680;

  input {
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

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}

function ProfileModal({ state, saving, onClose, onSave }: {
  state: EditorState;
  saving: boolean;
  onClose: () => void;
  onSave: (input: ProfileInput) => Promise<void>;
}) {
  const [customerName, setCustomerName] = useState(state.profile?.customerName ?? "");
  const [vehicleOwnerName, setVehicleOwnerName] = useState(state.profile?.vehicleOwnerName ?? "");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, saving]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave({ customerName: customerName.trim(), vehicleOwnerName: vehicleOwnerName.trim() });
  }

  return (
    <Overlay role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <ModalHeader>
          <div>
            <h2 id="profile-modal-title">{state.mode === "create" ? "Thêm hồ sơ mới" : "Chỉnh sửa hồ sơ"}</h2>
            <p>Nhập đầy đủ thông tin rồi bấm lưu để cập nhật dữ liệu.</p>
          </div>
          <CloseButton type="button" onClick={onClose} disabled={saving} aria-label="Đóng cửa sổ">
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={submit}>
          <Field>
            Tên Khách Hàng
            <input
              autoFocus
              required
              maxLength={120}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
            />
          </Field>
          <Field>
            Tên Chủ Phương Tiện
            <input
              required
              maxLength={120}
              value={vehicleOwnerName}
              onChange={(event) => setVehicleOwnerName(event.target.value)}
              placeholder="Ví dụ: Trần Minh Bình"
            />
          </Field>

          <FormActions>
            <SecondaryButton type="button" onClick={onClose} disabled={saving}>Huỷ</SecondaryButton>
            <PrimaryButton type="submit" disabled={saving || !customerName.trim() || !vehicleOwnerName.trim()}>
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
    void loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleProfiles = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    if (!normalizedQuery) return profiles;
    return profiles.filter((profile) =>
      normalize(`${profile.customerName} ${profile.vehicleOwnerName}`).includes(normalizedQuery),
    );
  }, [profiles, query]);

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
          <h1>Tổng hợp hồ sơ</h1>
          <p>Danh sách quản lí hồ sơ xe</p>
        </TitleBlock>
        <PrimaryButton type="button" onClick={() => setEditor({ mode: "create" })}>
          <FilePlus2 size={18} />
          Thêm hồ sơ
        </PrimaryButton>
      </Header>

      <Panel>
        <Toolbar>
          <h2>Thông tin khách hàng</h2>
          <SearchBox>
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên..."
              aria-label="Tìm hồ sơ theo tên"
            />
          </SearchBox>
        </Toolbar>

        {loading ? (
          <StateBox><div><LoaderCircle className="spin" size={30} /><h3>Đang tải hồ sơ</h3><p>Vui lòng chờ trong giây lát.</p></div></StateBox>
        ) : visibleProfiles.length === 0 ? (
          <StateBox>
            <div><Inbox size={34} /><h3>{query ? "Không tìm thấy kết quả" : "Chưa có hồ sơ"}</h3><p>{query ? "Hãy thử tìm bằng một tên khác." : "Bấm “Thêm hồ sơ” để tạo bản ghi đầu tiên."}</p></div>
          </StateBox>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Tên khách hàng</th>
                  <th>Tên chủ phương tiện</th>
                  <th>Cập nhật</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {visibleProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td><PersonCell><span><UserRound size={16} /></span>{profile.customerName}</PersonCell></td>
                    <td>{profile.vehicleOwnerName}</td>
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
