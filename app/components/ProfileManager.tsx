"use client";

import {
  BadgeCheck,
  BadgePlus,
  Box,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CarFront,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Coins,
  ContactRound,
  FilePlus2,
  HandCoins,
  IdCard,
  Inbox,
  ListChecks,
  LoaderCircle,
  PencilLine,
  ReceiptText,
  Search,
  Trash2,
  TrendingUp,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { type FocusEvent, FormEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

  @media (max-width: 640px) {
    text-align: center;

    h1 {
      font-size: 19px;
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

const MonthTabs = styled.div`
  position: relative;
  display: flex;
  width: fit-content;
  max-width: 100%;
  justify-content: flex-start;
  gap: 4px;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  padding: 4px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ActiveMonthPill = styled.span<{ $left: number; $width: number; $visible: boolean }>`
  position: absolute;
  top: 4px;
  left: 0;
  width: ${({ $width }) => `${$width}px`};
  height: 36px;
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
  min-height: 36px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0 14px;
  color: ${({ $active }) => ($active ? "white" : "#687086")};
  font-size: 12px;
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

const Toolbar = styled.div<{ $mobileSearchOpen: boolean }>`
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

  @media (max-width: 520px) {
    align-items: center;
    overflow: hidden;
    padding: 0;
    overscroll-behavior: none;
  }
`;

const Modal = styled.div`
  display: flex;
  width: min(980px, 100%);
  height: calc(100vh - 20px);
  height: calc(var(--modal-viewport-height, 100dvh) - 20px);
  max-height: 1100px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  background: white;
  box-shadow: 0 30px 90px rgba(14, 22, 45, 0.28);

  @media (max-width: 520px) {
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

  @media (max-width: 600px) {
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

  @media (max-width: 520px) {
    padding-bottom: calc(56px + env(safe-area-inset-bottom));
  }
`;

const FormSections = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;

  @media (max-width: 820px) {
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

  @media (max-width: 820px) {
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

const Field = styled.label`
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
  top: ${({ $floating }) => ($floating ? "calc(100% - 3.5px)" : "auto")};
  right: ${({ $floating }) => ($floating ? "0" : "auto")};
  z-index: ${({ $floating }) => ($floating ? "20" : "auto")};
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: ${({ $floating }) => ($floating ? "0" : "-2px")};
  justify-content: ${({ $alignDesktopRight }) => ($alignDesktopRight ? "flex-end" : "flex-start")};

  &::before {
    position: absolute;
    top: -6px;
    right: 18px;
    display: ${({ $floating }) => ($floating ? "block" : "none")};
    width: 12px;
    height: 12px;
    background: #edf0ff;
    content: "";
    transform: rotate(45deg);
  }

  button {
    position: relative;
    z-index: 1;
    display: inline-flex;
    min-height: 28px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 0;
    border-radius: 999px;
    background: #edf0ff;
    padding: 0 10px;
    color: var(--primary);
    font-size: ${({ $floating }) => ($floating ? "11px" : "12px")};
    font-weight: 700;
    line-height: 1;
    text-transform: none;
    cursor: pointer;
  }

  @media (max-width: 520px) {
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
    text-transform: uppercase;
    font-weight: 600;
    cursor: pointer;
  }

  option {
    text-transform: uppercase;
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

  @media (max-width: 520px) {
    align-items: center;
    flex-direction: row;
    gap: 26px;

    label {
      gap: 0;
      border-radius: 999px;
      background: #edf0ff;
      padding: 8px 13px 8px 9px;
      white-space: nowrap;
    }

    input {
      width: 19px;
      height: 19px;
      margin: 0 -2px 0 0;
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

  @media (max-width: 600px) {
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

  @media (max-width: 600px) {
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

function MoneyField({ icon, label, value, onChange }: {
  icon: ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const displayedValue = value
    ? new Intl.NumberFormat("vi-VN").format(Math.round(value / 1000))
    : "";

  return (
    <Field as="div">
      <FieldLabel>{icon}{label}</FieldLabel>
      <MoneyInputWrap>
        <input
          aria-label={label}
          type="text"
          inputMode="numeric"
          pattern="[0-9.]*"
          value={displayedValue}
          onFocus={(event) => {
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
          onClick={(event) => {
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
          onKeyDown={(event) => {
            if (!event.ctrlKey && !event.metaKey && event.key.length === 1 && !/^\d$/.test(event.key)) {
              event.preventDefault();
            }
          }}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            onChange((Number(digits) || 0) * 1000);
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
  onSave: (input: ProfileInput) => Promise<void>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ProfileInput>(() =>
    state.profile ? profileToInput(state.profile) : createEmptyProfileInput(),
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [ownerSuggestionsOpen, setOwnerSuggestionsOpen] = useState(false);
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

  useEffect(() => {
    const visualViewport = window.visualViewport;

    const syncVisualViewport = () => {
      const overlayElement = overlayRef.current;
      if (!overlayElement) return;

      const viewportHeight = visualViewport?.height ?? window.innerHeight;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      overlayElement.style.setProperty("--modal-viewport-height", `${viewportHeight}px`);
      overlayElement.style.setProperty("--modal-viewport-top", `${Math.max(0, viewportTop)}px`);

      window.requestAnimationFrame(() => {
        const formElement = overlayElement.querySelector<HTMLFormElement>("#profile-form");
        const activeElement = document.activeElement;
        if (!formElement || !(activeElement instanceof HTMLElement) || !formElement.contains(activeElement)) return;
        positionFieldInForm(formElement, activeElement, "auto");
      });
    };

    syncVisualViewport();
    visualViewport?.addEventListener("resize", syncVisualViewport);
    visualViewport?.addEventListener("scroll", syncVisualViewport);
    window.addEventListener("resize", syncVisualViewport);

    return () => {
      visualViewport?.removeEventListener("resize", syncVisualViewport);
      visualViewport?.removeEventListener("scroll", syncVisualViewport);
      window.removeEventListener("resize", syncVisualViewport);
    };
  }, []);

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
      Math.max(18, (formElement.clientHeight - fieldRect.height) * 0.28);

    formElement.scrollTo({ top: Math.max(0, targetTop), behavior });
  }

  function revealFocusedField(event: FocusEvent<HTMLFormElement>) {
    if (window.innerWidth > 520) return;

    const formElement = event.currentTarget;
    const fieldElement = event.target as HTMLElement;
    window.requestAnimationFrame(() => positionFieldInForm(formElement, fieldElement, "smooth"));
  }

  return (
    <Overlay ref={overlayRef} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <ModalHeader>
          <div>
            <h2 id="profile-modal-title">{state.mode === "create" ? "Thêm hồ sơ mới" : "Chỉnh sửa hồ sơ"}</h2>
            <p>{formatCurrentTime(currentTime)}</p>
          </div>
          <HeaderActions>
            <SecondaryButton type="button" onClick={onClose} disabled={saving}>Huỷ</SecondaryButton>
            <PrimaryButton
              type="submit"
              form="profile-form"
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
              <span className="save-label-full">{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
              <MobileSaveLabel>{saving ? "Đang lưu" : "Lưu"}</MobileSaveLabel>
            </PrimaryButton>
          </HeaderActions>
        </ModalHeader>

        <Form id="profile-form" onSubmit={submit} onFocusCapture={revealFocusedField}>
          <FormSections>
            <FormSection>
              <Field>
                <FieldLabel><UserRound size={14} />Tên khách hàng</FieldLabel>
                <input
                  autoFocus
                  required
                  maxLength={120}
                  value={form.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                  placeholder="Nhập tên khách hàng"
                />
              </Field>

              <Field as="div">
                <FieldLabel><ContactRound size={14} />Tên chủ phương tiện</FieldLabel>
                <input
                  aria-label="Tên chủ phương tiện"
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
                      Lấy Tên Khách Hàng
                    </button>
                  </SuggestionList>
                )}
              </Field>

              <Field>
                <FieldLabel><IdCard size={14} />Biển số xe</FieldLabel>
                <input
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
                  <select required value={form.vehicleType} onChange={(event) => updateField("vehicleType", event.target.value)}>
                    {VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type.toLocaleUpperCase("vi-VN")}</option>)}
                  </select>
                </SelectWrap>
              </Field>

              <Field>
                <FieldLabel><Building2 size={14} />Cơ quan nhận</FieldLabel>
                <SelectWrap>
                  <select required value={form.receivingAgency} onChange={(event) => updateField("receivingAgency", event.target.value)}>
                    {RECEIVING_AGENCIES.map((agency) => <option key={agency} value={agency}>{agency.toLocaleUpperCase("vi-VN")}</option>)}
                  </select>
                </SelectWrap>
              </Field>

              <Field>
                <FieldLabel><BriefcaseBusiness size={14} />Loại dịch vụ</FieldLabel>
                <SelectWrap>
                  <select required value={form.serviceType} onChange={(event) => updateField("serviceType", event.target.value)}>
                    {SERVICE_TYPES.map((service) => <option key={service} value={service}>{service.toLocaleUpperCase("vi-VN")}</option>)}
                  </select>
                </SelectWrap>
              </Field>
            </FormSection>

            <FormSection>
              <MoneyField icon={<Wallet size={14} />} label="Chi phí" value={form.cost} onChange={(value) => updateField("cost", value)} />
              <MoneyField icon={<ReceiptText size={14} />} label="Chi phí LPTB" value={form.registrationFeeCost} onChange={(value) => updateField("registrationFeeCost", value)} />
              <MoneyField icon={<Coins size={14} />} label="Chi phí khác" value={form.otherCost} onChange={(value) => updateField("otherCost", value)} />
              <MoneyField icon={<Box size={14} />} label="Phát sinh Hộp đen, Phù hiệu" value={form.blackBoxBadgeCost} onChange={(value) => updateField("blackBoxBadgeCost", value)} />
              <MoneyField icon={<BadgePlus size={14} />} label="Phát sinh khác" value={form.otherIncidentalCost} onChange={(value) => updateField("otherIncidentalCost", value)} />

              <CostSummary>
                <span><Calculator size={13} />Tổng chi phí</span>
                <strong>{formatCurrency(totalCost)}</strong>
              </CostSummary>
            </FormSection>

            <FormSection>
              <MoneyField icon={<HandCoins size={14} />} label="Chi phí ban đầu" value={form.initialCost} onChange={(value) => updateField("initialCost", value)} />

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
                <FieldLabel><BadgeCheck size={14} />Biển số xe mới</FieldLabel>
                <input
                  maxLength={30}
                  value={form.newVehiclePlate}
                  onChange={(event) => updateField("newVehiclePlate", event.target.value)}
                  placeholder="60X-123.45"
                />
              </Field>

              <Field>
                <FieldLabel><ClipboardCheck size={14} />Trạng thái</FieldLabel>
                <SelectWrap>
                  <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                    {PROFILE_STATUSES.map((status) => <option key={status} value={status}>{status.toLocaleUpperCase("vi-VN")}</option>)}
                  </select>
                </SelectWrap>
              </Field>

              <CostSummary>
                <span><TrendingUp size={13} />Lợi nhuận</span>
                <strong>{formatCurrency(profit)}</strong>
              </CostSummary>
            </FormSection>
          </FormSections>

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
    const activeTab = container.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');
    if (!activeTab) return;
    const centeredLeft = activeTab.offsetLeft - (container.clientWidth - activeTab.offsetWidth) / 2;
    container.scrollTo({
      left: Math.max(0, centeredLeft),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
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
