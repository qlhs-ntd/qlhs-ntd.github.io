"use client";

import {
  BadgeCheck,
  BadgePlus,
  Box,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Calendar,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock,
  Coins,
  Copy,
  CornerLeftDown,
  createLucideIcon,
  FilePlus2,
  HandCoins,
  IdCard,
  Inbox,
  ListChecks,
  Loader,
  LoaderCircle,
  MoreHorizontal,
  PencilLine,
  ReceiptText,
  Search,
  Trash2,
  TrendingUp,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { type FocusEvent, FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const UserShield = createLucideIcon("user-shield", [
  ["path", { d: "M10 15H6a4 4 0 0 0-4 4v2", key: "1nfge6" }],
  ["path", { d: "M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z", key: "16j3tf" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
]);

type StatusTabKey = "all" | "processing" | "waiting" | "paid" | "completed";

const STATUS_TABS: Array<{ key: StatusTabKey; label: string; matches: (profile: ProfileRecord) => boolean }> = [
  { key: "all", label: "Tất Cả", matches: () => true },
  { key: "processing", label: "Đang Xử Lí", matches: (profile) => (profile.status || "Đang xử lí") === "Đang xử lí" },
  { key: "waiting", label: "Chờ Thanh Toán", matches: (profile) => profile.status === "Đang chờ thanh toán" },
  { key: "paid", label: "Đã Thanh Toán", matches: (profile) => profile.status === "Đã thanh toán" },
  { key: "completed", label: "Hoàn Tất", matches: (profile) => profile.status === "Hoàn tất" || profile.status === "Đã hoàn tất" },
];

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 860px) {
    gap: 12px;
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

  @media (max-width: 860px) {
    h1 {
      font-size: 18px;
    }
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

const MonthSelectWrap = styled.div`
  position: relative;
  width: 160px;
  flex-shrink: 0;

  @media (max-width: 860px) {
    width: 135px;
  }
`;

const MonthSelect = styled.select`
  width: 100%;
  height: 42px;
  appearance: none;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
  padding: 0 32px 0 38px;
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(36, 48, 87, 0.04);
  transition: all 150ms ease;

  &:hover {
    border-color: var(--primary);
    background: white;
  }

  &:focus {
    border-color: var(--primary);
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px rgba(56, 89, 217, 0.15);
  }
`;

const CalendarIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  color: var(--primary);
`;

const DropdownIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  color: var(--primary);
`;

const Panel = styled.section`
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow);
`;

const Toolbar = styled.div<{ $mobileSearchOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 17px 20px;

  h2 {
    margin: 0;
    color: var(--ink);
    font-size: 15px;
  }

  @media (max-width: 560px) {
    align-items: center;
    flex-direction: row;
    gap: 10px;
    padding: 14px;

    ${PrimaryButton} {
      display: ${({ $mobileSearchOpen }) => ($mobileSearchOpen ? "none" : "inline-flex")};
      width: auto;
      min-height: 42px;
      margin-left: auto;
      padding: 0 14px;
    }
  }
`;

const StatusTabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
  padding: 0 20px 16px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 560px) {
    padding: 0 14px 14px;
    scroll-padding-inline: 14px;
  }
`;

const StatusTab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  min-width: max-content;
  height: 36px;
  align-items: center;
  gap: 8px;
  border: 1px solid ${({ $active }) => ($active ? "rgba(56, 89, 217, 0.4)" : "var(--line)")};
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#edf0ff" : "white")};
  padding: 0 12px;
  color: ${({ $active }) => ($active ? "var(--primary)" : "#626b7e")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 140ms ease;

  &:hover {
    border-color: rgba(56, 89, 217, 0.4);
    color: var(--primary);
  }
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "var(--primary)" : "#eef0f5")};
  padding: 0 7px;
  color: ${({ $active }) => ($active ? "white" : "#687086")};
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
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

    &:focus {
      border-color: rgba(56, 89, 217, 0.55);
      background: white;
    }
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

const MobileSearch = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 560px) {
    display: flex;
    min-width: 0;
    flex: ${({ $open }) => ($open ? "1 1 auto" : "0 0 auto")};
  }
`;

const MobileSearchButton = styled.button`
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fafbfc;
  padding: 0;
  color: #70798e;
  cursor: pointer;
`;

const MobileSearchField = styled.div`
  position: relative;
  width: 100%;
  animation: mobile-search-open 180ms cubic-bezier(0.22, 1, 0.36, 1);

  > svg {
    position: absolute;
    top: 50%;
    left: 13px;
    color: #8a91a3;
    pointer-events: none;
    transform: translateY(-50%);
  }

  input {
    width: 100%;
    height: 42px;
    border: 1px solid rgba(56, 89, 217, 0.55);
    border-radius: 12px;
    background: white;
    padding: 0 44px 0 40px;
    color: var(--ink);
    font-size: 13px;
    outline: none;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  button {
    position: absolute;
    top: 50%;
    right: 5px;
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border: 0;
    border-radius: 9px;
    background: transparent;
    padding: 0;
    color: #697185;
    cursor: pointer;
    transform: translateY(-50%);
  }

  @keyframes mobile-search-open {
    from {
      opacity: 0;
      transform: scaleX(0.86);
      transform-origin: left;
    }
  }
`;

const ProfileList = styled.div`
  display: grid;
  gap: 0;
`;

const ProfileGroup = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  padding: 0 18px;
  border-right: 1px solid #eff0f4;
`;

const ProfileRow = styled.article`
  position: relative;
  display: grid;
  grid-template-columns:
    minmax(230px, 1fr)
    minmax(225px, 1.35fr)
    minmax(220px, 1.2fr)
    72px;
  border-top: 1px solid #eff0f4;
  padding: 36px 20px;
  color: #4c5569;
  font-size: 16px;
  transition: background 120ms ease;

  &:hover {
    background: #fbfcff;
  }

  > ${ProfileGroup}:first-child {
    padding-left: 0;
  }

  > ${ProfileGroup}:last-child {
    border-right: 0;
    padding-right: 18px;
  }

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 14px;
    font-size: 15px;

    > ${ProfileGroup},
    > ${ProfileGroup}:first-child,
    > ${ProfileGroup}:last-child {
      border-right: 0;
      border-bottom: 1px solid #eff0f4;
      padding: 8px 0;
    }

    > ${ProfileGroup}:last-child {
      border-bottom: 0;
    }
  }

  @media (max-width: 1100px) {
    > ${ProfileGroup}:first-child > [aria-label="Trạng thái"] {
      padding-right: 82px;
    }

    > ${ProfileGroup}[aria-label="Chi Phí Dịch vụ hồ sơ"] {
      padding-top: 10px;
      padding-bottom: 8px;
    }

    > ${ProfileGroup}[aria-label="Chi Phí Dịch vụ hồ sơ"][data-cost-expanded="false"] {
      border-bottom: 0;
      padding-bottom: 0;
    }

    > ${ProfileGroup}[aria-label="Tổng kết chi phí"] {
      border-bottom: 0;
      padding-top: 10px;
    }

    > ${ProfileGroup}[aria-label="Thao tác hồ sơ"],
    > ${ProfileGroup}[aria-label="Thao tác hồ sơ"]:last-child {
      position: absolute;
      top: 14px;
      right: 14px;
      width: auto;
      border: 0;
      padding: 0;
    }
  }
`;

const ProfileField = styled.div`
  display: grid;
  gap: 5px;
`;

const ProfileValue = styled.span<{ $primary?: boolean }>`
  overflow-wrap: anywhere;
  color: #4c5569;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.4;

  @media (max-width: 1100px) {
    font-size: 14px;
  }
`;

const ProfileValueRow = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
`;

const MobileCopyButton = styled.button<{ $copied?: boolean }>`
  display: none;

  @media (max-width: 1100px) {
    display: inline-grid;
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
    place-items: center;
    border: 0;
    border-radius: 9px;
    background: ${({ $copied }) => ($copied ? "#e7f6ec" : "#f1f2f5")};
    padding: 0;
    color: ${({ $copied }) => ($copied ? "#217448" : "#20242e")};
    cursor: pointer;
    transition: background 160ms ease, color 160ms ease, transform 120ms ease;

    svg {
      width: 11px;
      height: 11px;
    }

    &:active {
      transform: scale(0.94);
    }
  }
`;

const CostValueActions = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  margin-left: auto;
`;

const ProfileIcon = styled.span<{ $tone?: "danger" | "success" }>`
  display: grid;
  width: 27px;
  height: 27px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: ${({ $tone }) =>
    $tone === "danger" ? "#fff1f3" : $tone === "success" ? "#e9f8ef" : "#f0f2fb"};
  color: ${({ $tone }) =>
    $tone === "danger" ? "var(--danger)" : $tone === "success" ? "#217448" : "var(--primary)"};
`;

const CostList = styled.div<{ $expanded?: boolean }>`
  display: grid;
  gap: 10px;

  @media (max-width: 1100px) {
    display: ${({ $expanded }) => ($expanded ? "grid" : "none")};
  }
`;

const CostLine = styled.div<{
  $total?: boolean;
  $profit?: boolean;
  $amountTone?: "primary" | "danger" | "success";
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #4c5569;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.4;

  @media (max-width: 1100px) {
    font-size: 14px;
  }

  > span {
    display: inline-flex;
    min-width: 0;
    align-items: center;
    gap: 6px;
    color: ${({ $amountTone }) =>
      $amountTone === "primary"
        ? "var(--primary)"
        : $amountTone === "danger"
          ? "var(--danger)"
          : $amountTone === "success"
            ? "#217448"
            : "inherit"};
    text-transform: capitalize;

    svg {
      flex: 0 0 auto;
    }
  }

  strong {
    flex: 0 0 auto;
    color: ${({ $amountTone }) =>
      $amountTone === "primary"
        ? "var(--primary)"
        : $amountTone === "danger"
          ? "var(--danger)"
          : $amountTone === "success"
            ? "#217448"
            : "inherit"};
    font-weight: inherit;
    white-space: nowrap;
  }
`;

const MobilePaperwork = styled.div`
  display: none;

  @media (max-width: 1100px) {
    display: grid;
    gap: 10px;
    border-top: 1px solid #e4e7ee;
    padding-top: 12px;
  }
`;

const DesktopPaperworkLine = styled(CostLine)`
  @media (max-width: 1100px) {
    display: none;
  }
`;

const GroupDivider = styled.div`
  height: 1px;
  background: #e4e7ee;
`;

const SummaryDivider = styled(GroupDivider)`
  @media (max-width: 1100px) {
    display: none;
  }
`;

const CostDetailsDivider = styled(GroupDivider)`
  @media (max-width: 1100px) {
    display: none;
  }
`;

const CostTotalLine = styled(CostLine)`
  @media (max-width: 1100px) {
    order: -2;
  }
`;

const CostToggleButton = styled.button<{ $expanded: boolean }>`
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--primary);
  font: inherit;
  text-align: left;
  text-transform: capitalize;
  cursor: default;

  .cost-toggle-chevron {
    display: none;
    flex: 0 0 auto;
    transition: transform 160ms ease;
  }

  @media (max-width: 1100px) {
    cursor: pointer;

    .cost-toggle-chevron {
      display: block;
      transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
    }
  }
`;

const StatusPill = styled.span<{ $status: string }>`
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "Hoàn tất" || $status === "Đã hoàn tất"
      ? "#217448"
      : $status === "Đã thanh toán"
        ? "var(--primary)"
        : $status === "Đang chờ thanh toán"
          ? "#7656c9"
        : "#c99300"};
  padding: 0 10px;
  color: white;
  font-size: 15px;
  font-weight: 650;
  white-space: nowrap;

  @media (max-width: 1100px) {
    font-size: 14px;
  }

  svg {
    flex: 0 0 auto;
  }
`;

const ActionGroup = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: flex-end;

  @media (max-width: 1100px) {
    display: flex;
  }
`;

const ActionMenuButton = styled.button<{ $active: boolean }>`
  display: inline-grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid ${({ $active }) => ($active ? "rgba(56, 89, 217, 0.38)" : "var(--line)")};
  border-radius: 10px;
  background: ${({ $active }) => ($active ? "#edf0ff" : "white")};
  color: ${({ $active }) => ($active ? "var(--primary)" : "#657087")};
  cursor: pointer;
  transition: 140ms ease;

  &:hover:not(:disabled) {
    border-color: rgba(56, 89, 217, 0.38);
    background: #edf0ff;
    color: var(--primary);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.45;
  }

  @media (max-width: 1100px) {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: ${({ $active }) => ($active ? "#edf0ff" : "#f1f2f5")};

    svg {
      width: 15px;
      height: 15px;
    }
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  top: calc(100% + 7px);
  right: 0;
  z-index: 35;
  width: 132px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: white;
  box-shadow: 0 14px 34px rgba(32, 39, 55, 0.14);
`;

const ActionMenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 9px;
  border: 0;
  border-bottom: 1px solid #eff0f4;
  background: white;
  padding: 0 12px;
  color: ${({ $danger }) => ($danger ? "var(--danger)" : "var(--ink)")};
  font-size: 14px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }

  &:hover:not(:disabled) {
    background: ${({ $danger }) => ($danger ? "#fff8f9" : "#f7f8fc")};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }

  svg {
    flex: 0 0 auto;
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

const Toast = styled.div<{ $error: boolean; $closing: boolean }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 80;
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

  @media (max-width: 1100px) {
    right: auto;
    bottom: auto;
    left: 50%;
    width: max-content;
    justify-content: center;
    border-radius: 999px;
    top: calc(14px + env(safe-area-inset-top, 0px));
    text-align: center;
    transform: translateX(-50%);
    animation: ${({ $closing }) =>
      $closing
        ? "mobile-toast-slide-up 280ms cubic-bezier(0.4, 0, 0.2, 1) both"
        : "mobile-toast-slide-down 320ms cubic-bezier(0.16, 1, 0.3, 1) both"};
  }

  @keyframes mobile-toast-slide-down {
    from {
      opacity: 0;
      transform: translate3d(-50%, -22px, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(-50%, 0, 0);
    }
  }

  @keyframes mobile-toast-slide-up {
    from {
      opacity: 1;
      transform: translate3d(-50%, 0, 0);
    }

    to {
      opacity: 0;
      transform: translate3d(-50%, -18px, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: var(--modal-viewport-top, 0px);
  right: 0;
  bottom: auto;
  left: 0;
  height: 100vh;
  height: var(--modal-viewport-height, 100dvh);
  z-index: 50;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: rgba(17, 24, 43, 0.5);
  padding: 10px 24px;
  backdrop-filter: blur(5px);

  @media (max-width: 1100px) {
    align-items: center;
    overflow: hidden;
    padding: 0;
    overscroll-behavior: none;
  }
`;

const MobileModalPageCover = styled.div`
  display: none;

  @media (max-width: 1100px) {
    position: fixed;
    inset: 0;
    z-index: 49;
    display: block;
    background: white;
  }
`;

const Modal = styled.div<{ $closing: boolean }>`
  --modal-enter-offset: 34px;
  --modal-edge-opacity: 0;
  display: flex;
  width: min(980px, 100%);
  height: fit-content;
  max-height: calc(100vh - 20px);
  max-height: calc(var(--modal-viewport-height, 100dvh) - 20px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  background: white;
  box-shadow: 0 30px 90px rgba(14, 22, 45, 0.28);
  animation: ${({ $closing }) =>
    $closing
      ? "modal-slide-down 300ms cubic-bezier(0.4, 0, 0.2, 1) both"
      : "modal-slide-up 440ms cubic-bezier(0.16, 1, 0.3, 1) both"};

  @keyframes modal-slide-up {
    from {
      opacity: var(--modal-edge-opacity);
      transform: translate3d(0, var(--modal-enter-offset), 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes modal-slide-down {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    to {
      opacity: var(--modal-edge-opacity);
      transform: translate3d(0, var(--modal-enter-offset), 0);
    }
  }

  @media (max-width: 1100px) {
    --modal-enter-offset: 100%;
    --modal-edge-opacity: 1;
    height: var(--modal-viewport-height, 100dvh);
    max-height: none;
    border-radius: 0;
    -webkit-text-size-adjust: 88%;
    text-size-adjust: 88%;

    input:not([type="checkbox"]),
    select,
    textarea {
      font-size: 14px !important;
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ModalHeader = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--line);
  background: white;
  padding: 15px 20px;
  flex: 0 0 auto;

  h2 {
    margin: 0 0 5px;
    color: var(--ink);
    font-size: 20px;
    letter-spacing: -0.025em;
    text-transform: capitalize;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
  }

  @media (max-width: 1100px) {
    min-height: 64px;
    align-items: center;
    justify-content: center;
    padding: 10px 70px;

    > div:first-child {
      min-width: 0;
      text-align: center;
    }

    h2 {
      margin-bottom: 3px;
      font-size: 16px;
    }

    p {
      font-size: 11px;
    }
  }
`;

const Form = styled.form`
  min-height: 0;
  overflow-y: auto;
  padding: 22px 24px 24px;
  overscroll-behavior: contain;
  scroll-padding: 18px 0 32vh;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 1100px) {
    padding-bottom: calc(96px + env(safe-area-inset-bottom));
  }
`;

const FormSections = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.section`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid var(--line);
  padding: 0 18px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border-right: 0;
    padding-right: 0;
  }

  @media (max-width: 1100px) {
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 18px 0;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
  }
`;

const Field = styled.div`
  position: relative;
  display: grid;
  gap: 8px;
  color: #3d465b;
  font-size: 13px;
  font-weight: 680;
  text-transform: capitalize;

  input,
  select {
    width: 100%;
    height: 46px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: #fbfbfd;
    padding: 0 14px;
    color: var(--ink);
    font-size: 14px;
    font-weight: 500;
    text-transform: none;
    transition: 130ms ease;

    &:focus {
      border-color: rgba(56, 89, 217, 0.6);
      background: white;
      outline: none;
    }

    &:disabled {
      color: #7d8496;
      cursor: not-allowed;
    }
  }
`;

const FieldLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  svg {
    flex: 0 0 auto;
    color: var(--primary);
  }
`;

const SuggestionList = styled.div<{ $alignDesktopRight?: boolean; $floating?: boolean }>`
  position: ${({ $floating }) => ($floating ? "absolute" : "static")};
  top: auto;
  right: ${({ $floating }) => ($floating ? "0" : "auto")};
  bottom: ${({ $floating }) => ($floating ? "40px" : "auto")};
  z-index: ${({ $floating }) => ($floating ? "20" : "auto")};
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: ${({ $floating }) => ($floating ? "0" : "-2px")};
  justify-content: ${({ $alignDesktopRight }) => ($alignDesktopRight ? "flex-end" : "flex-start")};

  button {
    position: relative;
    z-index: 1;
    display: inline-flex;
    min-height: 24px;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: 0;
    border-radius: 999px;
    background: #edf0ff;
    padding: 0 10px;
    color: var(--primary);
    font-size: ${({ $floating }) => ($floating ? "9px" : "12px")};
    font-weight: 700;
    line-height: 1;
    text-transform: none;
    cursor: pointer;
  }

  @media (max-width: 1100px) {
    display: flex;
    justify-content: flex-start;
  }
`;

const MoneyInputWrap = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 46px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fbfbfd;
  padding: 0 8px 0 14px;
  transition: 130ms ease;

  &:focus-within {
    border-color: rgba(56, 89, 217, 0.6);
    background: white;
  }

  input {
    position: absolute;
    inset: 0 48px 0 0;
    z-index: 2;
    width: calc(100% - 48px);
    height: 100%;
    border: 0;
    border-radius: 12px 0 0 12px;
    background: transparent;
    padding: 0 14px;
    color: transparent;
    caret-color: transparent;
    text-align: left;
    font-variant-numeric: tabular-nums;
    cursor: text;
    opacity: 0;
    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      margin: 0;
      appearance: none;
    }

    &:focus {
      border: 0;
      background: transparent;
      box-shadow: none;
    }
  }

  .money-display {
    display: flex;
    min-width: 0;
    align-items: baseline;
    pointer-events: none;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .money-major {
    color: var(--ink);
    font-size: 18px;
    font-weight: 720;
    line-height: 1;
  }

  .money-major.is-placeholder {
    color: #aeb4c2;
    opacity: 0.72;
  }

  .money-minor {
    color: var(--ink);
    font-size: 18px;
    font-weight: 720;
    line-height: 1;
    transition: color 140ms ease, opacity 140ms ease;
  }

  .money-minor.is-placeholder {
    color: #aeb4c2;
    opacity: 0.72;
  }

  .money-caret {
    position: relative;
    width: 0;
    height: 18px;
    opacity: 0;

    &::after {
      position: absolute;
      inset: 0 auto 0 0;
      width: 1px;
      background: var(--primary);
      content: "";
    }
  }

  input:focus + .money-display .money-caret {
    opacity: 1;
    animation: money-caret-blink 1s steps(1) infinite;
  }

  input:focus + .money-display .money-minor {
    color: var(--ink);
    opacity: 1;
  }

  > span {
    display: grid;
    min-width: 34px;
    height: 32px;
    place-items: center;
    border-radius: 8px;
    background: #edf0ff;
    color: var(--primary);
    font-size: 13px;
    font-weight: 750;
    pointer-events: none;
    text-transform: none;
  }

  .money-currency {
    margin-left: auto;
    padding: 0 8px;
  }

  @keyframes money-caret-blink {
    50% {
      opacity: 0;
    }
  }
`;

const SelectWrap = styled.div`
  position: relative;

  select {
    display: block;
    appearance: none;
    padding: 0 38px 0 14px;
    line-height: 44px;
    text-indent: 0;
    text-transform: capitalize;
    font-weight: 600;
    cursor: pointer;
  }

  option {
    text-transform: capitalize;
  }

  &::after {
    position: absolute;
    top: 50%;
    right: 16px;
    width: 6px;
    height: 6px;
    border-right: 1.5px solid var(--primary);
    border-bottom: 1.5px solid var(--primary);
    pointer-events: none;
    content: "";
    transform: translateY(-65%) rotate(45deg);
  }
`;

const CheckGroup = styled.div`
  display: flex;
  min-height: 48px;
  align-items: center;
  flex-direction: row;
  gap: 18px;
  border: 0;
  background: transparent;
  padding: 10px 0;

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

  @media (max-width: 1024px) {
    min-height: 0;
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 8px 0;
  }

  @media (max-width: 1100px) {
    align-items: center;
    flex-direction: row;
    gap: 12px;
    padding: 8px 4px;

    label {
      gap: 0;
      border-radius: 999px;
      background: #edf0ff;
      padding: 8px 15px 8px 11px;
      white-space: nowrap;
    }

    input {
      width: 17px;
      height: 17px;
      margin: 0 -1px 0 0;
    }
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
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    color: var(--muted);
    font-size: 12px;

    svg {
      flex: 0 0 auto;
      color: var(--primary);
    }
  }

  strong {
    color: var(--ink);
    font-size: 18px;
  }

`;

const HeaderActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 1100px) {
    position: absolute;
    inset: 0 12px;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;

    button {
      min-height: 36px;
      flex: 0 0 auto;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 13px;
      pointer-events: auto;
    }

    button svg {
      display: none;
    }

    .save-label-full {
      display: none;
    }
  }
`;

const MobileSaveLabel = styled.span`
  display: none;

  @media (max-width: 1100px) {
    display: inline;
  }
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

const DeleteOverlay = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  background: rgba(17, 24, 43, 0.52);
  padding: 20px;
  backdrop-filter: blur(5px);
  animation: ${({ $closing }) => ($closing ? "delete-overlay-out 220ms ease both" : "delete-overlay-in 220ms ease both")};

  @keyframes delete-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes delete-overlay-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const DeleteDialog = styled.div<{ $closing: boolean }>`
  width: min(430px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 20px;
  background: white;
  padding: 24px;
  box-shadow: 0 30px 90px rgba(14, 22, 45, 0.28);
  animation: ${({ $closing }) =>
    $closing
      ? "delete-dialog-out 240ms cubic-bezier(0.4, 0, 0.2, 1) both"
      : "delete-dialog-in 340ms cubic-bezier(0.16, 1, 0.3, 1) both"};

  @keyframes delete-dialog-in {
    from {
      opacity: 0;
      transform: translate3d(0, 24px, 0) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes delete-dialog-out {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
    to {
      opacity: 0;
      transform: translate3d(0, 18px, 0) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const DeleteIcon = styled.span`
  display: grid;
  width: 48px;
  height: 48px;
  margin-bottom: 17px;
  place-items: center;
  border-radius: 14px;
  background: #fff1f3;
  color: var(--danger);
`;

const DeleteContent = styled.div`
  h2 {
    margin: 0 0 8px;
    color: var(--ink);
    font-size: 20px;
    letter-spacing: -0.025em;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
  }

  strong {
    color: var(--ink);
    font-weight: 700;
  }
`;

const DeleteActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 23px;

  button {
    min-height: 44px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
  }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #c92f48;
  background: var(--danger);
  color: white;
  cursor: pointer;
  transition: 140ms ease;

  &:hover:not(:disabled) {
    background: #bd2f46;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

type EditorState = { mode: "create"; profile?: undefined } | { mode: "edit"; profile: ProfileRecord };

function DeleteConfirmModal({
  profile,
  deleting,
  onClose,
  onConfirm,
}: {
  profile: ProfileRecord;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}) {
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => {
    if (deleting || closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
  }, [closing, deleting, onClose]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("profile-modal-open");
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("profile-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [requestClose]);

  async function confirmDelete() {
    const deleted = await onConfirm();
    if (!deleted) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
    else setClosing(true);
  }

  return (
    <DeleteOverlay
      $closing={closing}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <DeleteDialog
        $closing={closing}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-profile-title"
        aria-describedby="delete-profile-description"
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) onClose();
        }}
      >
        <DeleteIcon><Trash2 size={22} /></DeleteIcon>
        <DeleteContent>
          <h2 id="delete-profile-title">Xoá hồ sơ?</h2>
          <p id="delete-profile-description">
            Bạn có chắc muốn xoá hồ sơ của <strong>{profile.customerName}</strong>? Dữ liệu trong Google Sheets cũng sẽ bị xoá.
          </p>
        </DeleteContent>
        <DeleteActions>
          <SecondaryButton type="button" onClick={requestClose} disabled={deleting || closing}>Huỷ</SecondaryButton>
          <DeleteButton type="button" onClick={() => void confirmDelete()} disabled={deleting || closing}>
            {deleting ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
            {deleting ? "Đang xoá..." : "Xoá Hồ Sơ"}
          </DeleteButton>
        </DeleteActions>
      </DeleteDialog>
    </DeleteOverlay>
  );
}

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

function hasCopyableVehiclePlate(value: string) {
  const normalizedValue = normalize(value.trim());
  return Boolean(normalizedValue) && normalizedValue !== "cho cap" && normalizedValue !== "chua cap";
}

function formatCurrentTime(value: Date) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);

  return `${date} ${time}`;
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value || 0)} VNĐ`;
}

function capitalizeWords(value: string) {
  return value.replace(/(^|[\s/-])(\p{L})/gu, (_, separator: string, letter: string) =>
    `${separator}${letter.toLocaleUpperCase("vi-VN")}`,
  );
}

function formatCreatedAt(value: string) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "—";

  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(createdAt);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

  return `${time} ${date}`;
}

function formatStatus(value: string) {
  const status = value || "Đang xử lí";
  return capitalizeWords(
    status === "Hoàn tất" || status === "Đã hoàn tất" ? "Đã hoàn tất" : status,
  );
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

const PROFILE_YEAR = 2026;

function getYearEndMonths() {
  const months = [8, 9, 10, 11, 12];
  const current = new Date();
  const currentMonth = current.getMonth() + 1;

  if (current.getFullYear() === PROFILE_YEAR && months.indexOf(currentMonth) === -1) {
    months.push(currentMonth);
    months.sort(function (a, b) { return a - b; });
  }

  return months.map((month) => {
    return {
      key: `${PROFILE_YEAR}-${String(month).padStart(2, "0")}`,
      label: `Tháng ${month}`,
      year: PROFILE_YEAR,
    };
  });
}

function MoneyField({ icon, label, value, onChange }: {
  icon: ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const displayedValue = value
    ? new Intl.NumberFormat("vi-VN").format(Math.round(value / 1000))
    : "";
  const numericInputValue = value ? Math.round(value / 1000) : "";

  return (
    <Field as="div">
      <FieldLabel>{icon}{label}</FieldLabel>
      <MoneyInputWrap>
        <input
          aria-label={label}
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          autoComplete="off"
          value={numericInputValue}
          onKeyDown={(event) => {
            if (!event.ctrlKey && !event.metaKey && event.key.length === 1 && !/^\d$/.test(event.key)) {
              event.preventDefault();
            }
          }}
          onChange={(event) => {
            const amountInThousands = Math.max(0, Math.trunc(Number(event.target.value) || 0));
            onChange(amountInThousands * 1000);
          }}
          placeholder="0"
        />
        <div className="money-display" aria-hidden="true">
          <span className={`money-major${displayedValue ? "" : " is-placeholder"}`}>{displayedValue || "0"}</span>
          <span className="money-caret" />
          <span className={`money-minor${displayedValue ? "" : " is-placeholder"}`}>.000</span>
        </div>
        <span className="money-currency" aria-hidden="true">VNĐ</span>
      </MoneyInputWrap>
    </Field>
  );
}

function ProfileModal({ state, saving, onClose, onSave }: {
  state: EditorState;
  saving: boolean;
  onClose: () => void;
  onSave: (input: ProfileInput) => Promise<boolean>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const formScrollTopBeforeInputRef = useRef<number | null>(null);
  const formScrollLockFrameRef = useRef<number | null>(null);
  const [form, setForm] = useState<ProfileInput>(() =>
    state.profile ? profileToInput(state.profile) : createEmptyProfileInput(),
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [ownerSuggestionsOpen, setOwnerSuggestionsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const { totalCost, profit } = calculateProfileCosts(form);

  const requestClose = useCallback(() => {
    if (saving || closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
  }, [closing, onClose, saving]);

  function updateField<Key extends keyof ProfileInput>(key: Key, value: ProfileInput[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentTime(new Date()), 1000);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("profile-modal-open");
    document.body.style.overflow = "hidden";
    return () => {
      window.clearInterval(clock);
      if (formScrollLockFrameRef.current !== null) {
        window.cancelAnimationFrame(formScrollLockFrameRef.current);
      }
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("profile-modal-open");
      document.body.style.overflow = "";
    };
  }, [requestClose]);

  useEffect(() => {
    const visualViewport = window.visualViewport;

    const syncViewportSize = () => {
      const overlayElement = overlayRef.current;
      if (!overlayElement) return;

      const viewportHeight = visualViewport?.height ?? window.innerHeight;
      overlayElement.style.setProperty("--modal-viewport-height", `${viewportHeight}px`);
    };

    syncViewportSize();
    visualViewport?.addEventListener("resize", syncViewportSize);
    window.addEventListener("resize", syncViewportSize);

    return () => {
      visualViewport?.removeEventListener("resize", syncViewportSize);
      window.removeEventListener("resize", syncViewportSize);
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amountOrZero = (value: number) => Number.isFinite(value) && value > 0 ? value : 0;
    const saved = await onSave({
      ...form,
      customerName: form.customerName.trim(),
      vehicleOwnerName: form.vehicleOwnerName.trim(),
      vehiclePlate: form.vehiclePlate.trim(),
      newVehiclePlate: form.newVehiclePlate.trim(),
      cost: amountOrZero(form.cost),
      registrationFeeCost: amountOrZero(form.registrationFeeCost),
      otherCost: amountOrZero(form.otherCost),
      blackBoxBadgeCost: amountOrZero(form.blackBoxBadgeCost),
      otherIncidentalCost: amountOrZero(form.otherIncidentalCost),
      initialCost: amountOrZero(form.initialCost),
      owesVehiclePlate: form.owesVehiclePlate === true,
      owesRegistration: form.owesRegistration === true,
    });
    if (saved) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
      else setClosing(true);
    }
  }

  function positionFieldInForm(
    formElement: HTMLFormElement,
    fieldElement: HTMLElement,
    behavior: ScrollBehavior,
  ) {
    const formRect = formElement.getBoundingClientRect();
    const fieldRect = fieldElement.getBoundingClientRect();
    const targetTop =
      formElement.scrollTop +
      fieldRect.top -
      formRect.top -
      Math.max(18, (formElement.clientHeight - fieldRect.height) * 0.36);

    formElement.scrollTo({ top: Math.max(0, targetTop), behavior });
  }

  function revealFocusedField(event: FocusEvent<HTMLFormElement>) {
    if (window.innerWidth > 1100) return;

    const formElement = event.currentTarget;
    const fieldElement = event.target as HTMLElement;
    window.requestAnimationFrame(() => positionFieldInForm(formElement, fieldElement, "smooth"));
  }

  function lockFormPosition(formElement: HTMLFormElement, inputElement: EventTarget | null) {
    const scrollTop = formScrollTopBeforeInputRef.current;
    if (scrollTop === null) return;
    const lockStartedAt = performance.now();

    if (formScrollLockFrameRef.current !== null) {
      window.cancelAnimationFrame(formScrollLockFrameRef.current);
    }

    const restorePosition = () => {
      if (document.activeElement !== inputElement) {
        formScrollTopBeforeInputRef.current = null;
        formScrollLockFrameRef.current = null;
        return;
      }

      formElement.scrollTop = scrollTop;
      if (performance.now() - lockStartedAt < 180) {
        formScrollLockFrameRef.current = window.requestAnimationFrame(restorePosition);
        return;
      }

      formScrollTopBeforeInputRef.current = null;
      formScrollLockFrameRef.current = null;
    };

    formScrollLockFrameRef.current = window.requestAnimationFrame(restorePosition);
  }

  function rememberFormPositionBeforeInput(event: FormEvent<HTMLFormElement>) {
    if (window.innerWidth > 1100) return;
    formScrollTopBeforeInputRef.current = event.currentTarget.scrollTop;
    lockFormPosition(event.currentTarget, event.target);
  }

  function keepFormPositionAfterInput(event: FormEvent<HTMLFormElement>) {
    if (window.innerWidth > 1100 || formScrollTopBeforeInputRef.current === null) return;
    lockFormPosition(event.currentTarget, event.target);
  }

  return (
    <>
      <MobileModalPageCover aria-hidden="true" />
      <Overlay ref={overlayRef} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && requestClose()}>
      <Modal
        $closing={closing}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) onClose();
        }}
      >
        <ModalHeader>
          <div>
            <h2 id="profile-modal-title">{state.mode === "create" ? "Thêm hồ sơ mới" : "Chỉnh sửa hồ sơ"}</h2>
            <p>{formatCurrentTime(currentTime)}</p>
          </div>
          <HeaderActions>
            <SecondaryButton type="button" onClick={requestClose} disabled={saving || closing}>Huỷ</SecondaryButton>
            <PrimaryButton
              type="submit"
              form="profile-form"
              disabled={
                saving ||
                closing ||
                !form.customerName.trim() ||
                !form.vehicleOwnerName.trim() ||
                !form.vehiclePlate.trim()
              }
            >
              {saving ? <LoaderCircle className="spin" size={17} /> : <CheckCircle2 size={17} />}
              <span className="save-label-full">{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
              <MobileSaveLabel>{saving ? "Đang lưu" : "Lưu"}</MobileSaveLabel>
            </PrimaryButton>
          </HeaderActions>
        </ModalHeader>

        <Form
          id="profile-form"
          autoComplete="off"
          onSubmit={submit}
          onFocusCapture={revealFocusedField}
          onBeforeInputCapture={rememberFormPositionBeforeInput}
          onKeyDownCapture={(event) => {
            if (window.innerWidth <= 1100 && (event.key === "Backspace" || event.key === "Delete")) {
              formScrollTopBeforeInputRef.current = event.currentTarget.scrollTop;
              lockFormPosition(event.currentTarget, event.target);
            }
          }}
          onInputCapture={keepFormPositionAfterInput}
        >
          <FormSections>
            <FormSection>
              <Field>
                <FieldLabel><UserRound size={14} />Tên khách hàng</FieldLabel>
                <input
                  aria-label="Tên khách hàng"
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  required
                  maxLength={120}
                  value={form.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                  placeholder="Nhập tên khách hàng"
                />
              </Field>

              <Field as="div">
                <FieldLabel><UserShield size={14} />Tên chủ phương tiện</FieldLabel>
                <input
                  aria-label="Tên chủ phương tiện"
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  required
                  maxLength={120}
                  value={form.vehicleOwnerName}
                  onFocus={() => setOwnerSuggestionsOpen(true)}
                  onBlur={() => setOwnerSuggestionsOpen(false)}
                  onChange={(event) => updateField("vehicleOwnerName", event.target.value)}
                  placeholder="Nhập tên chủ phương tiện"
                />
                {ownerSuggestionsOpen && form.customerName.trim() && (
                  <SuggestionList $alignDesktopRight $floating aria-label="Gợi ý tên chủ phương tiện">
                    <button
                      type="button"
                      aria-label="Điền tên khách hàng vào tên chủ phương tiện"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        updateField("vehicleOwnerName", form.customerName.trim());
                        setOwnerSuggestionsOpen(false);
                      }}
                      onClick={() => {
                        updateField("vehicleOwnerName", form.customerName.trim());
                        setOwnerSuggestionsOpen(false);
                      }}
                    >
                      <CornerLeftDown size={10} aria-hidden="true" />
                      Tên Khách Hàng
                    </button>
                  </SuggestionList>
                )}
              </Field>

              <Field>
                <FieldLabel><IdCard size={14} />Biển Số Cũ</FieldLabel>
                <input
                  aria-label="Biển Số Cũ"
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  maxLength={30}
                  value={form.vehiclePlate}
                  onChange={(event) => updateField("vehiclePlate", event.target.value)}
                  placeholder="60X-123.45"
                />
              </Field>

              <Field>
                <FieldLabel><CarFront size={14} />Loại xe</FieldLabel>
                <SelectWrap>
                  <select aria-label="Loại xe" value={form.vehicleType} onChange={(event) => updateField("vehicleType", event.target.value)}>
                    {VEHICLE_TYPES.map((type) => <option key={type} value={type}>{capitalizeWords(type)}</option>)}
                  </select>
                </SelectWrap>
              </Field>

              <Field>
                <FieldLabel><Building2 size={14} />Cơ quan nhận</FieldLabel>
                <SelectWrap>
                  <select aria-label="Cơ quan nhận" value={form.receivingAgency} onChange={(event) => updateField("receivingAgency", event.target.value)}>
                    {RECEIVING_AGENCIES.map((agency) => <option key={agency} value={agency}>{capitalizeWords(agency)}</option>)}
                  </select>
                </SelectWrap>
              </Field>

              <Field>
                <FieldLabel><BriefcaseBusiness size={14} />Loại dịch vụ</FieldLabel>
                <SelectWrap>
                  <select aria-label="Loại dịch vụ" value={form.serviceType} onChange={(event) => updateField("serviceType", event.target.value)}>
                    {SERVICE_TYPES.map((service) => <option key={service} value={service}>{capitalizeWords(service)}</option>)}
                  </select>
                </SelectWrap>
              </Field>
            </FormSection>

            <FormSection>
              <MoneyField icon={<Wallet size={14} />} label="Chi Phí Dịch vụ" value={form.cost} onChange={(value) => updateField("cost", value)} />
              <MoneyField icon={<ReceiptText size={14} />} label="Chi phí LPTB" value={form.registrationFeeCost} onChange={(value) => updateField("registrationFeeCost", value)} />
              <MoneyField icon={<Coins size={14} />} label="Chi phí khác" value={form.otherCost} onChange={(value) => updateField("otherCost", value)} />
              <MoneyField icon={<Box size={14} />} label="Hộp đen, Phù hiệu" value={form.blackBoxBadgeCost} onChange={(value) => updateField("blackBoxBadgeCost", value)} />
              <MoneyField icon={<BadgePlus size={14} />} label="Phát sinh khác" value={form.otherIncidentalCost} onChange={(value) => updateField("otherIncidentalCost", value)} />

              <CostSummary>
                <span><Calculator size={13} />Tổng Chi Phí Khách Trả</span>
                <strong>{formatCurrency(totalCost)}</strong>
              </CostSummary>
            </FormSection>

            <FormSection>
              <Field as="div">
                <FieldLabel><ListChecks size={14} />Theo dõi giấy tờ</FieldLabel>
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
                <FieldLabel><BadgeCheck size={14} />Biển số mới</FieldLabel>
                <input
                  aria-label="Biển số mới"
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={30}
                  value={form.newVehiclePlate}
                  onChange={(event) => updateField("newVehiclePlate", event.target.value)}
                  placeholder="60X-123.45"
                />
              </Field>

              <MoneyField icon={<HandCoins size={14} />} label="Chi phí ban đầu" value={form.initialCost} onChange={(value) => updateField("initialCost", value)} />

              <Field>
                <FieldLabel><ClipboardCheck size={14} />Trạng thái</FieldLabel>
                <SelectWrap>
                  <select aria-label="Trạng thái" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                    {PROFILE_STATUSES.map((status) => <option key={status} value={status}>{capitalizeWords(status)}</option>)}
                  </select>
                </SelectWrap>
              </Field>

              <CostSummary>
                <span><TrendingUp size={13} />Lợi Nhuận</span>
                <strong>{formatCurrency(profit)}</strong>
              </CostSummary>
            </FormSection>
          </FormSections>

        </Form>
      </Modal>
      </Overlay>
    </>
  );
}

export function ProfileManager() {
  const monthTabs = useMemo(() => getYearEndMonths(), []);
  const copyResetTimerRef = useRef<number | null>(null);
  const statusTabsRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(`${PROFILE_YEAR}-08`);
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTabKey>("all");
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<ProfileRecord | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const [toastClosing, setToastClosing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedCostIds, setExpandedCostIds] = useState<Set<string>>(() => new Set());
  const isCurrentMonthSelected = selectedMonth === monthKey(new Date());

  useEffect(() => {
    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    if (current.getFullYear() === PROFILE_YEAR) {
      setSelectedMonth(`${PROFILE_YEAR}-${String(currentMonth).padStart(2, "0")}`);
    }
  }, []);

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
    setToastClosing(false);
    const closeTimer = window.setTimeout(() => setToastClosing(true), 3280);
    const removeTimer = window.setTimeout(() => setToast(null), 3600);
    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast]);

  useEffect(() => () => {
    if (copyResetTimerRef.current !== null) window.clearTimeout(copyResetTimerRef.current);
  }, []);

  useEffect(() => {
    const activeTab = statusTabsRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    activeTab?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeStatusTab]);

  const monthlyProfiles = useMemo(() => profiles.filter((profile) => {
    const createdAt = new Date(profile.createdAt);
    return !Number.isNaN(createdAt.getTime()) && monthKey(createdAt) === selectedMonth;
  }), [profiles, selectedMonth]);

  const activeStatus = STATUS_TABS.find((tab) => tab.key === activeStatusTab) ?? STATUS_TABS[0];

  const statusTabCounts = useMemo(() => {
    const counts = new Map<StatusTabKey, number>();
    for (const tab of STATUS_TABS) {
      counts.set(tab.key, monthlyProfiles.filter(tab.matches).length);
    }
    return counts;
  }, [monthlyProfiles]);

  const visibleProfiles = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return monthlyProfiles.filter((profile) => {
      if (!activeStatus.matches(profile)) return false;
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
  }, [activeStatus, monthlyProfiles, query]);

  async function copyProfileValue(value: string, label: string, key: string) {
    const copyValue = value.trim();
    if (!copyValue) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyValue);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = copyValue;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Không thể sao chép");
      }
      setCopiedKey(key);
      if (copyResetTimerRef.current !== null) window.clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopiedKey(null);
        copyResetTimerRef.current = null;
      }, 1400);
      setToast({ message: `Đã sao chép ${label}.`, error: false });
    } catch {
      setToast({ message: `Không thể sao chép ${label}.`, error: true });
    }
  }

  async function saveProfile(input: ProfileInput) {
    if (!editor) return false;
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
      return true;
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Không thể lưu hồ sơ.", error: true });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(profile: ProfileRecord) {
    setDeletingId(profile.id);
    try {
      await profileService.remove(profile.id);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      setToast({ message: "Đã xoá hồ sơ.", error: false });
      return true;
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Không thể xoá hồ sơ.", error: true });
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell>
      <Header>
        <TitleBlock>
          <h1>Danh Sách Hồ Sơ</h1>
        </TitleBlock>
        <MonthSelectWrap>
          <CalendarIcon>
            <Calendar size={18} />
          </CalendarIcon>
          <MonthSelect
            aria-label="Lọc hồ sơ theo tháng"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {monthTabs.map((month) => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </MonthSelect>
          <DropdownIcon>
            <ChevronDown size={18} />
          </DropdownIcon>
        </MonthSelectWrap>
      </Header>

      <Panel>
        <Toolbar $mobileSearchOpen={mobileSearchOpen}>
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
          <MobileSearch $open={mobileSearchOpen}>
            {mobileSearchOpen ? (
              <MobileSearchField>
                <Search size={17} />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên, biển số..."
                  aria-label="Tìm hồ sơ theo tên hoặc biển số"
                />
                <button
                  type="button"
                  aria-label="Đóng tìm kiếm"
                  onClick={() => {
                    setQuery("");
                    setMobileSearchOpen(false);
                  }}
                >
                  <X size={17} />
                </button>
              </MobileSearchField>
            ) : (
              <MobileSearchButton
                type="button"
                aria-label="Mở tìm kiếm"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={18} />
              </MobileSearchButton>
            )}
          </MobileSearch>
          <PrimaryButton
            type="button"
            disabled={!isCurrentMonthSelected}
            title={!isCurrentMonthSelected ? "Chỉ có thể thêm hồ sơ vào tháng hiện tại" : undefined}
            onClick={() => setEditor({ mode: "create" })}
          >
            <FilePlus2 size={18} />
            Thêm hồ sơ
          </PrimaryButton>
        </Toolbar>
        <StatusTabs ref={statusTabsRef} role="tablist" aria-label="Lọc hồ sơ theo trạng thái">
          {STATUS_TABS.map((tab) => {
            const active = activeStatusTab === tab.key;
            return (
              <StatusTab
                key={tab.key}
                type="button"
                role="tab"
                $active={active}
                aria-selected={active}
                onClick={() => setActiveStatusTab(tab.key)}
              >
                {tab.label}
                <StatusBadge $active={active}>{statusTabCounts.get(tab.key) ?? 0}</StatusBadge>
              </StatusTab>
            );
          })}
        </StatusTabs>

        {loading ? (
          <StateBox><div><LoaderCircle className="spin" size={30} /><h3>Đang tải hồ sơ</h3></div></StateBox>
        ) : visibleProfiles.length === 0 ? (
          <StateBox>
            <div><Inbox size={34} /><h3>{query ? "Không tìm thấy kết quả" : activeStatusTab === "all" ? "Chưa có hồ sơ trong tháng này" : "Chưa có hồ sơ trong trạng thái này"}</h3></div>
          </StateBox>
        ) : (
          <ProfileList aria-label="Danh sách hồ sơ">
            {visibleProfiles.map((profile) => (
              <ProfileRow key={profile.id} aria-label={`Hồ sơ ${profile.customerName}`}>
                <ProfileGroup>
                  <ProfileField aria-label="Trạng thái">
                    <div>
                      <StatusPill $status={profile.status}>
                        {profile.status === "Hoàn tất" || profile.status === "Đã hoàn tất"
                          ? <CheckCircle2 size={12} />
                          : profile.status === "Đã thanh toán"
                            ? <BadgeCheck size={12} />
                            : profile.status === "Đang chờ thanh toán"
                              ? <Clock size={12} />
                            : <Loader size={12} />}
                        {formatStatus(profile.status)}
                      </StatusPill>
                    </div>
                  </ProfileField>
                  <ProfileField aria-label="Ngày giờ tạo hồ sơ">
                    <ProfileValueRow>
                      <ProfileIcon><Clock size={14} /></ProfileIcon>
                      <ProfileValue>{formatCreatedAt(profile.createdAt)}</ProfileValue>
                    </ProfileValueRow>
                  </ProfileField>
                  <ProfileField aria-label="Cơ quan nhận và loại dịch vụ">
                    <ProfileValueRow>
                      <ProfileIcon><Building2 size={14} /></ProfileIcon>
                      <ProfileValue>
                        {[
                          profile.receivingAgency ? capitalizeWords(profile.receivingAgency) : "",
                          profile.serviceType ? capitalizeWords(profile.serviceType) : "",
                        ].filter(Boolean).join(" - ") || "—"}
                      </ProfileValue>
                    </ProfileValueRow>
                  </ProfileField>
                  <GroupDivider />
                    <ProfileField aria-label="Tên khách">
                      <ProfileValueRow>
                        <ProfileIcon><UserRound size={14} /></ProfileIcon>
                        <ProfileValue $primary>{profile.customerName || "—"}</ProfileValue>
                        {profile.customerName && (
                          <MobileCopyButton $copied={copiedKey === `${profile.id}:customer`} type="button" aria-label="Sao chép tên khách hàng" title="Sao chép tên khách hàng" onClick={() => void copyProfileValue(profile.customerName, "tên khách hàng", `${profile.id}:customer`)}>
                            {copiedKey === `${profile.id}:customer` ? <Check size={12} /> : <Copy size={12} />}
                          </MobileCopyButton>
                        )}
                      </ProfileValueRow>
                    </ProfileField>
                    <ProfileField aria-label="Tên chủ phương tiện">
                      <ProfileValueRow>
                        <ProfileIcon><UserShield size={14} /></ProfileIcon>
                        <ProfileValue>{profile.vehicleOwnerName || "—"}</ProfileValue>
                        {profile.vehicleOwnerName && (
                          <MobileCopyButton $copied={copiedKey === `${profile.id}:owner`} type="button" aria-label="Sao chép tên người đại diện" title="Sao chép tên người đại diện" onClick={() => void copyProfileValue(profile.vehicleOwnerName, "tên người đại diện", `${profile.id}:owner`)}>
                            {copiedKey === `${profile.id}:owner` ? <Check size={12} /> : <Copy size={12} />}
                          </MobileCopyButton>
                        )}
                      </ProfileValueRow>
                    </ProfileField>
                    <ProfileField aria-label="Loại xe và Biển Số Cũ">
                      <ProfileValueRow>
                        <ProfileIcon><CarFront size={14} /></ProfileIcon>
                        <ProfileValue>
                          {[
                            profile.vehicleType ? capitalizeWords(profile.vehicleType) : "",
                            profile.vehiclePlate,
                          ].filter(Boolean).join(" - ") || "—"}
                        </ProfileValue>
                        {profile.vehiclePlate && (
                          <MobileCopyButton $copied={copiedKey === `${profile.id}:old-plate`} type="button" aria-label="Sao chép Biển Số Cũ" title="Sao chép Biển Số Cũ" onClick={() => void copyProfileValue(profile.vehiclePlate, "Biển Số Cũ", `${profile.id}:old-plate`)}>
                            {copiedKey === `${profile.id}:old-plate` ? <Check size={12} /> : <Copy size={12} />}
                          </MobileCopyButton>
                        )}
                      </ProfileValueRow>
                    </ProfileField>
                    <MobilePaperwork aria-label="Theo dõi giấy tờ và biển số mới">
                      <CostLine><span><ProfileIcon><IdCard size={14} /></ProfileIcon>Nợ Biển Số</span><strong>{profile.owesVehiclePlate ? "Có" : "Không"}</strong></CostLine>
                      <CostLine><span><ProfileIcon><ListChecks size={14} /></ProfileIcon>Nợ Giấy Tờ</span><strong>{profile.owesRegistration ? "Có" : "Không"}</strong></CostLine>
                      <CostLine>
                        <span><ProfileIcon><BadgeCheck size={14} /></ProfileIcon>Biển Số Mới</span>
                        <CostValueActions>
                          <strong>{profile.newVehiclePlate || "Chờ Cấp"}</strong>
                          {hasCopyableVehiclePlate(profile.newVehiclePlate) && (
                            <MobileCopyButton $copied={copiedKey === `${profile.id}:new-plate`} type="button" aria-label="Sao chép biển số mới" title="Sao chép biển số mới" onClick={() => void copyProfileValue(profile.newVehiclePlate, "biển số mới", `${profile.id}:new-plate`)}>
                              {copiedKey === `${profile.id}:new-plate` ? <Check size={12} /> : <Copy size={12} />}
                            </MobileCopyButton>
                          )}
                        </CostValueActions>
                      </CostLine>
                    </MobilePaperwork>
                </ProfileGroup>

                <ProfileGroup
                  aria-label="Chi Phí Dịch vụ hồ sơ"
                  data-cost-expanded={expandedCostIds.has(profile.id) ? "true" : "false"}
                >
                  <CostList id={`cost-details-${profile.id}`} $expanded={expandedCostIds.has(profile.id)}>
                    <CostLine><span><ProfileIcon><Wallet size={13} /></ProfileIcon>Chi Phí Dịch vụ</span><strong>{formatCurrency(profile.cost)}</strong></CostLine>
                    <CostLine><span><ProfileIcon><ReceiptText size={13} /></ProfileIcon>Chi phí LPTB</span><strong>{formatCurrency(profile.registrationFeeCost)}</strong></CostLine>
                    <CostLine><span><ProfileIcon><Coins size={13} /></ProfileIcon>Chi phí khác</span><strong>{formatCurrency(profile.otherCost)}</strong></CostLine>
                    <CostLine><span><ProfileIcon><Box size={13} /></ProfileIcon>Hộp đen, Phù hiệu</span><strong>{formatCurrency(profile.blackBoxBadgeCost)}</strong></CostLine>
                    <CostLine><span><ProfileIcon><BadgePlus size={13} /></ProfileIcon>Phát sinh khác</span><strong>{formatCurrency(profile.otherIncidentalCost)}</strong></CostLine>
                  </CostList>
                  <CostDetailsDivider />
                  <CostTotalLine $total $amountTone="primary">
                    <CostToggleButton
                      type="button"
                      $expanded={expandedCostIds.has(profile.id)}
                      aria-expanded={expandedCostIds.has(profile.id)}
                      aria-controls={`cost-details-${profile.id}`}
                      onClick={() => setExpandedCostIds((current) => {
                        const next = new Set(current);
                        if (next.has(profile.id)) next.delete(profile.id);
                        else next.add(profile.id);
                        return next;
                      })}
                    >
                      <ProfileIcon><Calculator size={14} /></ProfileIcon>
                      Tổng Chi Phí Khách Trả
                      <ChevronDown className="cost-toggle-chevron" size={14} />
                    </CostToggleButton>
                    <strong>{formatCurrency(profile.totalCost)}</strong>
                  </CostTotalLine>
                </ProfileGroup>

                <ProfileGroup aria-label="Tổng kết chi phí">
                  <DesktopPaperworkLine><span><ProfileIcon><IdCard size={14} /></ProfileIcon>Nợ Biển Số</span><strong>{profile.owesVehiclePlate ? "Có" : "Không"}</strong></DesktopPaperworkLine>
                  <DesktopPaperworkLine><span><ProfileIcon><ListChecks size={14} /></ProfileIcon>Nợ Giấy Tờ</span><strong>{profile.owesRegistration ? "Có" : "Không"}</strong></DesktopPaperworkLine>
                  <DesktopPaperworkLine><span><ProfileIcon><BadgeCheck size={14} /></ProfileIcon>Biển Số Mới</span><strong>{profile.newVehiclePlate || "Chờ Cấp"}</strong></DesktopPaperworkLine>
                  <SummaryDivider />
                  <CostLine $total $amountTone="danger"><span><ProfileIcon $tone="danger"><HandCoins size={14} /></ProfileIcon>Chi phí ban đầu</span><strong>{formatCurrency(profile.initialCost)}</strong></CostLine>
                  <CostLine $total $profit $amountTone="success"><span><ProfileIcon $tone="success"><TrendingUp size={14} /></ProfileIcon>Lợi nhuận</span><strong>{formatCurrency(profile.profit)}</strong></CostLine>
                </ProfileGroup>

                <ProfileGroup aria-label="Thao tác hồ sơ">
                  <ActionGroup>
                    <ActionMenuButton
                      type="button"
                      $active={openActionId === profile.id}
                      aria-label={`Mở thao tác hồ sơ ${profile.customerName}`}
                      aria-expanded={openActionId === profile.id}
                      aria-haspopup="menu"
                      onClick={() => setOpenActionId((current) => (current === profile.id ? null : profile.id))}
                    >
                      <MoreHorizontal size={17} />
                    </ActionMenuButton>
                    {openActionId === profile.id && (
                      <ActionMenu role="menu" aria-label={`Thao tác hồ sơ ${profile.customerName}`}>
                        <ActionMenuItem
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setOpenActionId(null);
                            setEditor({ mode: "edit", profile });
                          }}
                        >
                          <PencilLine size={15} />
                          Sửa
                        </ActionMenuItem>
                        <ActionMenuItem
                          $danger
                          type="button"
                          role="menuitem"
                          disabled={deletingId === profile.id}
                          onClick={() => {
                            setOpenActionId(null);
                            setDeleteConfirmation(profile);
                          }}
                        >
                          {deletingId === profile.id ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}
                          Xoá
                        </ActionMenuItem>
                      </ActionMenu>
                    )}
                  </ActionGroup>
                </ProfileGroup>
              </ProfileRow>
            ))}
          </ProfileList>
        )}
      </Panel>

      {editor && <ProfileModal state={editor} saving={saving} onClose={() => setEditor(null)} onSave={saveProfile} />}
      {deleteConfirmation && (
        <DeleteConfirmModal
          profile={deleteConfirmation}
          deleting={deletingId === deleteConfirmation.id}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={() => deleteProfile(deleteConfirmation)}
        />
      )}
      {toast && <Toast $error={toast.error} $closing={toastClosing}>{toast.error ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}{toast.message}</Toast>}
    </AppShell>
  );
}
