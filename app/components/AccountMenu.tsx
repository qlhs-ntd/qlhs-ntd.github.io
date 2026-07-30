"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { AUTH_ROUTE, clearSession } from "../lib/auth";

const publicBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const Menu = styled.div`
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
`;

const Trigger = styled.button`
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 11px;
  background: transparent;
  cursor: pointer;
  padding: 0;

  &:hover {
    background: #f0f2f6;
  }

  img {
    width: 32px;
    height: 32px;
    border-radius: 9px;
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

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: 150px;
  padding: 6px;
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 16px 38px rgba(32, 44, 84, 0.17);

  button {
    display: flex;
    width: 100%;
    min-height: 38px;
    align-items: center;
    gap: 8px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #c6344c;
    cursor: pointer;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 700;
  }

  button:hover {
    background: #fff1f3;
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeWhenClickingOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    return () => document.removeEventListener("pointerdown", closeWhenClickingOutside);
  }, [isOpen]);

  const requestLogout = () => {
    setIsOpen(false);
    setIsConfirmingLogout(true);
  };

  const logout = () => {
    clearSession();
    router.replace(AUTH_ROUTE);
  };

  return (
    <Menu ref={menuRef}>
      <Trigger
        type="button"
        aria-label="Mở menu tài khoản"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={`${publicBasePath}/logo.png`} alt="" />
      </Trigger>
      {isOpen && (
        <Popover>
          <button type="button" onClick={requestLogout}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </Popover>
      )}
      {isConfirmingLogout && (
        <ConfirmOverlay
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setIsConfirmingLogout(false);
          }}
        >
          <ConfirmDialog role="dialog" aria-modal="true" aria-labelledby="logout-confirmation-title">
            <h2 id="logout-confirmation-title">Đăng xuất?</h2>
            <p>Bạn sẽ cần nhập lại mã bảo mật để truy cập QLHS.</p>
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
