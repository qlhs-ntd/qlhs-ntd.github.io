"use client";

import { FileSpreadsheet, KeyRound, LockKeyhole, MonitorSmartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { AUTH_ROUTE, clearSession, getSessionDeviceName, getSessionStartedAt } from "../lib/auth";

const publicBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const googleSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL?.trim()
  || "https://docs.google.com/spreadsheets/d/1-MEP_pzW8r8yajZmkcZ5C4XAbc1ncHVpKadcyUThZK8/edit?gid=0#gid=0";

const Menu = styled.div`
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
`;

const AvatarTrigger = styled.button`
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0;
  border-radius: 11px;
  background: transparent;
  cursor: pointer;
  padding: 0;

  ${Menu}:hover & {
    background: #f0f2f6;
  }

  img {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    object-fit: cover;
  }

  @media (max-width: 860px) {
    width: 34px;
    height: 34px;

    img {
      width: 29px;
      height: 29px;
      border-radius: 8px;
    }
  }
`;

const AccountOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(16, 24, 40, 0.38);
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 14px;
  }
`;

const AccountDialog = styled.div`
  position: relative;
  width: min(100%, 360px);
  max-width: calc(100vw - 28px);
  border-radius: 22px;
  background: #fff;
  padding: 26px;
  box-shadow: 0 24px 70px rgba(16, 24, 40, 0.26);
`;

const AccountCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #f3f5f8;
  color: #687086;
  cursor: pointer;

  &:hover {
    background: #e8ebf1;
    color: var(--ink);
  }
`;

const AccountAvatar = styled.img`
  display: block;
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.18);
  object-fit: cover;
`;

const AccountName = styled.p`
  margin: -10px 0 22px;
  color: var(--ink);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-align: center;
`;

const AccountLinkCard = styled.div`
  display: flex;
  width: 100%;
  min-height: 52px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  border: 1px solid #e5e8ef;
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  padding: 9px 15px;
  font-size: 14px;
  font-weight: 750;
`;

const SessionCard = styled(AccountLinkCard)`
  margin-top: 12px;
`;

const AccountCardTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
`;

const SessionTime = styled.span`
  color: #3859d9;
  font-size: 12px;
  font-weight: 650;
`;

const GoogleSheetLink = styled.a`
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 5px;
  color: #3859d9;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;

  span {
    min-width: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-height: 1.35;
  }

  &:hover {
    text-decoration: underline;
  }

`;

const LogoutButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 20px;
  border: 0;
  border-radius: 14px;
  background: #fff0f2;
  color: #c6344c;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;

  &:hover {
    background: #ffe2e7;
  }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(16, 24, 40, 0.38);
  padding: 20px;
`;

const ConfirmDialog = styled.div`
  width: min(100%, 360px);
  border-radius: 20px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 24px 70px rgba(16, 24, 40, 0.26);

  h2 {
    margin: 0;
    color: var(--ink);
    font-size: 20px;
    letter-spacing: -0.025em;
  }

  p {
    margin: 9px 0 22px;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.55;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    min-height: 40px;
    border: 0;
    border-radius: 12px;
    cursor: pointer;
    padding: 0 15px;
    font-size: 14px;
    font-weight: 750;
  }

  button:first-child {
    background: #eef0f5;
    color: var(--ink);
  }

  button:last-child {
    background: #c6344c;
    color: #fff;
  }
`;

export function AccountMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionDeviceName, setSessionDeviceName] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSessionStartedAt(getSessionStartedAt());
      setSessionDeviceName(getSessionDeviceName());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const requestLogout = () => {
    setIsOpen(false);
    setIsConfirmingLogout(true);
  };

  const logout = () => {
    clearSession();
    router.replace(AUTH_ROUTE);
  };

  const sessionTime = sessionStartedAt === null
    ? "Đang tải thời gian đăng nhập…"
    : new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      hour: "2-digit",
      hourCycle: "h23",
      minute: "2-digit",
      month: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
      year: "2-digit",
    }).format(new Date(sessionStartedAt));

  return (
    <Menu>
      <AvatarTrigger type="button" aria-label="Mở menu tài khoản" onClick={() => setIsOpen(true)}>
        <img src={`${publicBasePath}/avatar-dung.jpeg`} alt="" />
      </AvatarTrigger>
      {isOpen && (
        <AccountOverlay role="presentation" onPointerDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}>
          <AccountDialog role="dialog" aria-modal="true" aria-label="Tài khoản" onPointerDown={(event) => event.stopPropagation()}>
            <AccountCloseButton type="button" aria-label="Đóng menu tài khoản" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </AccountCloseButton>
            <AccountAvatar src={`${publicBasePath}/avatar-dung.jpeg`} alt="Ảnh đại diện Dũng" />
            <AccountName>Dũng - QLHS</AccountName>
            <AccountLinkCard>
              <AccountCardTitle><FileSpreadsheet size={17} />Link Google Sheet</AccountCardTitle>
              <GoogleSheetLink href={googleSheetUrl} target="_blank" rel="noreferrer" title={googleSheetUrl}>
                <span>{googleSheetUrl}</span>
              </GoogleSheetLink>
            </AccountLinkCard>
            <SessionCard>
              <AccountCardTitle><KeyRound size={15} />Phiên Đăng Nhập</AccountCardTitle>
              <SessionTime>Đăng nhập lần cuối lúc {sessionTime}</SessionTime>
            </SessionCard>
            <SessionCard>
              <AccountCardTitle><MonitorSmartphone size={15} />Thiết Bị Đăng Nhập</AccountCardTitle>
              <SessionTime>{sessionDeviceName || "Đang tải thiết bị…"}</SessionTime>
            </SessionCard>
            <LogoutButton type="button" onClick={requestLogout}>
              <LockKeyhole size={17} />
              Đăng Xuất
            </LogoutButton>
          </AccountDialog>
        </AccountOverlay>
      )}
      {isConfirmingLogout && (
        <ConfirmOverlay
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setIsConfirmingLogout(false);
          }}
        >
          <ConfirmDialog role="dialog" aria-modal="true" aria-labelledby="logout-confirmation-title">
            <h2 id="logout-confirmation-title">Đăng Xuất</h2>
            <p>Kết thúc phiên đăng nhập hiện tại và khoá truy cập vào trang.</p>
            <ConfirmActions>
              <button type="button" onClick={() => setIsConfirmingLogout(false)}>Huỷ</button>
              <button type="button" onClick={logout}>Đăng xuất</button>
            </ConfirmActions>
          </ConfirmDialog>
        </ConfirmOverlay>
      )}
    </Menu>
  );
}
