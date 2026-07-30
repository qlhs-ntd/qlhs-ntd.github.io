"use client";

import {
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CarFront,
  ChevronDown,
  ClockArrowUp,
  FolderOpen,
  Info,
  ListChevronsUpDown,
  Loader,
  TrendingUp,
  UserSearch,
  UserStar,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  profileService,
  RECEIVING_AGENCIES,
  SERVICE_TYPES,
  VEHICLE_TYPES,
  type ProfileRecord,
} from "../lib/profiles";
import { AppShell } from "./AppShell";
import { AccountMenu } from "./AccountMenu";
import { ProfileManager } from "./ProfileManager";

const PROFILE_YEAR = 2026;
const REVENUE_MODAL_CLOSE_MS = 280;

const SpinnerIcon = styled(Loader)`
  animation: revenue-value-spin 850ms linear infinite;

  @keyframes revenue-value-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Header = styled.header<{ $customerMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  h1 {
    margin: 0;
    color: var(--ink);
    font-size: clamp(22px, 2.7vw, 30px);
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  @media (max-width: 1199px) {
    gap: 12px;

    h1 {
      font-size: 18px;
    }
  }

  @media (max-width: 640px) {
    ${({ $customerMode }) => $customerMode && "flex-wrap: wrap;"}
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderFilters = styled.div<{ $customerMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 640px) {
    ${({ $customerMode }) => $customerMode && `
      display: contents;
      width: 100%;
      justify-content: flex-end;
    `}
  }
`;

const MonthSelectWrap = styled.div`
  position: relative;
  width: 160px;
  flex-shrink: 0;

  @media (max-width: 1199px) {
    width: 135px;
  }
`;

const CustomerSelectWrap = styled(MonthSelectWrap)`
  width: 220px;

  @media (max-width: 1199px) {
    width: 165px;
  }

  @media (max-width: 640px) {
    width: 100%;
    flex: 0 0 100%;
    margin-left: 0;
  }
`;

const CustomerSelectPlaceholder = styled.span`
  position: absolute;
  top: 50%;
  right: 32px;
  left: 38px;
  overflow: hidden;
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
  text-overflow: ellipsis;
  transform: translateY(-50%);
  white-space: nowrap;
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

const ContentWrap = styled.div`
  width: 100%;
`;

const CustomerSelectionPrompt = styled.div`
  display: grid;
  width: 100%;
  min-height: 280px;
  place-items: center;
  align-content: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--muted);
  padding: 24px;
  font-size: 14px;
  font-weight: 750;
  text-align: center;
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

const SummaryLayout = styled.section`
  display: grid;
  gap: 12px;
  margin-bottom: 18px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
  }
`;

const FinancialColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (max-width: 1199px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryMetricColumn = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 1200px) {
    height: 100%;
  }
`;

const MetricSection = styled.div<{ $topPadding?: boolean }>`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  column-gap: 9px;
  padding-top: ${({ $topPadding }) => ($topPadding ? "12px" : "0")};

  > span {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 10px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 1199px) {
    grid-template-columns: 30px minmax(0, 1fr);
    column-gap: 8px;

    > span {
      width: 30px;
      height: 30px;
      border-radius: 9px;

      svg {
        width: 15px;
        height: 15px;
      }
    }
  }
`;

const MetricSectionLabel = styled.small<{ $tone: "danger" | "success" }>`
  display: block;
  color: ${({ $tone }) => getMetricToneColor($tone)};
  font-size: 14px;
  font-weight: 650;
  line-height: 1.4;
  text-transform: capitalize;

  @media (max-width: 1199px) {
    color: #121316;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }
`;

type MetricTone = "primary" | "danger" | "success" | "warning" | "violet";
type StatusTone = "processing" | "waiting" | "paid" | "completed" | "neutral";

function getMetricToneBackground(tone: MetricTone) {
  if (tone === "danger") return "#fff1f3";
  if (tone === "success") return "#e9f8ef";
  if (tone === "warning") return "#fff6d9";
  if (tone === "violet") return "#f1edff";
  return "#edf0ff";
}

function getMetricToneColor(tone: MetricTone) {
  if (tone === "danger") return "var(--danger)";
  if (tone === "success") return "#217448";
  if (tone === "warning") return "#a66f00";
  if (tone === "violet") return "#7656c9";
  return "var(--primary)";
}

const MetricCard = styled.article<{
  $tone: MetricTone;
}>`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-content: start;
  align-items: center;
  column-gap: 9px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 16px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  @media (min-width: 1200px) {
    height: 100%;
  }

  > span {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 10px;
    background: ${({ $tone }) => getMetricToneBackground($tone)};
    color: ${({ $tone }) => getMetricToneColor($tone)};

    svg {
      width: 16px;
      height: 16px;
    }
  }

  small {
    display: block;
    color: var(--ink);
    font-size: 14px;
    font-weight: 650;
    line-height: 1.4;
    text-transform: capitalize;
  }

  strong {
    grid-column: 1 / -1;
    margin-top: 14px;
    color: var(--ink);
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  @media (max-width: 1199px) {
    padding: 11px;
    grid-template-columns: 30px minmax(0, 1fr);
    column-gap: 8px;

    > span {
      width: 30px;
      height: 30px;
      border-radius: 9px;

      svg {
        width: 15px;
        height: 15px;
      }
    }

    small {
      color: #121316;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }

    strong {
      margin-top: 10px;
      font-size: 18px;
    }
  }
`;

const StatusSummaryCard = styled.article`
  border: 1px solid #eceef3;
  border-radius: 24px;
  background: #ffffff;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  @media (min-width: 1200px) {
    height: 100%;
  }

  @media (max-width: 1199px) {
    padding: 16px 14px;
  }
`;

const StatusTotalWrap = styled.div`
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8ebf2;

  @media (max-width: 1199px) {
    padding-bottom: 14px;
    margin-bottom: 14px;
  }
`;

const StatusTotalHeader = styled.div`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  column-gap: 9px;

  > span {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 10px;
    background: #edf0ff;
    color: var(--primary);

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 1199px) {
    grid-template-columns: 30px minmax(0, 1fr);
    column-gap: 8px;

    > span {
      width: 30px;
      height: 30px;
      border-radius: 9px;

      svg {
        width: 15px;
        height: 15px;
      }
    }
  }
`;

const StatusTotalLabel = styled.div`
  color: #121316;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: capitalize;

  @media (max-width: 1199px) {
    font-size: 14px;
  }
`;

const StatusTotalValue = styled.div`
  margin-top: 10px;
  color: #121316;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;

  @media (max-width: 1199px) {
    margin-top: 8px;
    font-size: 18px;
  }
`;

const StatusProgressList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const StatusProgressItem = styled.div`
  display: grid;
  gap: 9px;
`;

const StatusProgressLabel = styled.div<{ $tone: StatusTone }>`
  color: #121316;
  font-size: 14px;
  font-weight: ${({ $tone }) => ($tone === "processing" || $tone === "waiting" ? 650 : 600)};
  letter-spacing: -0.03em;
  line-height: 1.2;

  @media (max-width: 1199px) {
    font-size: 13px;
  }
`;

const StatusProgressRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;

  @media (max-width: 1199px) {
    gap: 12px;
  }
`;

const StatusProgressTrack = styled.div`
  position: relative;
  width: 100%;
  max-width: 660px;
  height: 10px;
  justify-self: start;
  border-radius: 3px;
  background: #eef0f4;
  overflow: hidden;

  @media (max-width: 1199px) {
    max-width: none;
    height: 9px;
  }
`;

const StatusProgressFill = styled.div<{ $tone: StatusTone; $width: number }>`
  width: ${({ $width }) => `${$width}%`};
  min-width: ${({ $width }) => ($width > 0 ? "10px" : "0")};
  height: 100%;
  border-radius: 3px;
  transform-origin: left center;
  background: ${({ $tone }) =>
    $tone === "neutral"
      ? "#2b313a"
      : $tone === "processing"
      ? "#f0a018"
      : $tone === "waiting"
        ? "#7b61ff"
        : $tone === "paid"
          ? "#3859d9"
          : "#24a36a"};
  transition: width 520ms ease;
  animation: revenue-progress-grow 720ms cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes revenue-progress-grow {
    from {
      transform: scaleX(0);
    }

    to {
      transform: scaleX(1);
    }
  }
`;

const StatusProgressValue = styled.strong`
  color: #121316;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;

  @media (max-width: 1199px) {
    font-size: 13px;
  }
`;

const CurrencyValue = styled.div<{ $tone: "primary" | "danger" | "success" }>`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 14px;

  strong {
    margin-top: 0;
    color: ${({ $tone }) => getMetricToneColor($tone)};
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  span {
    display: inline;
    color: ${({ $tone }) => getMetricToneColor($tone)};
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  @media (max-width: 1199px) {
    margin-top: 10px;

    strong {
      font-size: 18px;
    }

    span {
      font-size: 18px;
    }
  }
`;

const LoadingValue = styled.div`
  grid-column: 1 / -1;
  display: inline-flex;
  width: fit-content;
  align-items: center;
  margin-top: 14px;
  color: #687086;

  @media (max-width: 1199px) {
    margin-top: 10px;
  }
`;

const CurrencyLoadingValue = styled(LoadingValue)`
  margin-top: 0;
`;

const CurrencyInfoButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 2px;
  border: 0;
  border-radius: 999px;
  background: #f4f5f8;
  color: #121316;
  cursor: pointer;

  &:hover {
    background: #eceff4;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(56, 89, 217, 0.18);
  }

  svg {
    width: 15px;
    height: 15px;
  }

  @media (max-width: 1199px) {
    width: 24px;
    height: 24px;

    svg {
      width: 13px;
      height: 13px;
    }
  }
`;

const MetricDivider = styled.div`
  grid-column: 1 / -1;
  width: 100%;
  height: 1px;
  margin-top: 14px;
  background: #e8ebf2;

  @media (max-width: 1199px) {
    margin-top: 10px;
  }
`;

const MetricBreakdownList = styled.div`
  grid-column: 1 / -1;
  display: grid;
  gap: 20px;
  margin-top: 12px;

  @media (max-width: 1199px) {
    gap: 18px;
    margin-top: 10px;
  }
`;

const MetricBreakdownItem = styled.div`
  display: grid;
  gap: 9px;
`;

const MetricBreakdownRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  color: #121316;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1.2;

  strong {
    color: #121316;
    margin-top: 0;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    white-space: nowrap;
  }

  @media (max-width: 1199px) {
    font-size: 13px;

    strong {
      font-size: 13px;
    }
  }
`;

const MetricBreakdownTrack = styled.div`
  position: relative;
  width: 100%;
  max-width: 660px;
  height: 10px;
  justify-self: start;
  border-radius: 3px;
  background: #eef0f4;
  overflow: hidden;

  @media (max-width: 1199px) {
    max-width: none;
    height: 9px;
  }
`;

const MetricBreakdownFill = styled.div<{
  $width: number;
  $tone?: "neutral" | "processing" | "waiting" | "paid" | "completed";
}>`
  width: ${({ $width }) => `${$width}%`};
  min-width: ${({ $width }) => ($width > 0 ? "10px" : "0")};
  height: 100%;
  border-radius: 3px;
  transform-origin: left center;
  background: ${({ $tone = "neutral" }) =>
    $tone === "processing"
      ? "#f0a018"
      : $tone === "waiting"
        ? "#7b61ff"
      : $tone === "paid"
        ? "#3859d9"
        : $tone === "completed"
          ? "#24a36a"
          : "#2b313a"};
  transition: width 520ms ease;
  animation: revenue-progress-grow 720ms cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes revenue-progress-grow {
    from {
      transform: scaleX(0);
    }

    to {
      transform: scaleX(1);
    }
  }
`;

const ErrorMessage = styled.p`
  margin: -4px 0 18px;
  border: 1px solid #f1c8cf;
  border-radius: 12px;
  background: #fff4f6;
  padding: 12px 14px;
  color: #a92e43;
  font-size: 13px;
`;

const CostModalOverlay = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.32);
  padding: 24px;
  backdrop-filter: blur(5px);
  animation: ${({ $closing }) =>
    $closing ? "revenue-overlay-out 220ms ease both" : "revenue-overlay-in 220ms ease both"};

  @keyframes revenue-overlay-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes revenue-overlay-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @media (max-width: 1199px) {
    align-items: flex-end;
    padding: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CostModalDialog = styled.div<{ $closing: boolean }>`
  --revenue-modal-enter-offset: 24px;
  --revenue-modal-edge-opacity: 0;
  width: min(560px, 100%);
  max-height: min(80vh, 860px);
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 30px 90px rgba(14, 22, 45, 0.28);
  padding: 22px 22px 20px;
  animation: ${({ $closing }) =>
    $closing
      ? "revenue-modal-out 280ms cubic-bezier(0.4, 0, 0.2, 1) both"
      : "revenue-modal-in 360ms cubic-bezier(0.16, 1, 0.3, 1) both"};

  @keyframes revenue-modal-in {
    from {
      opacity: var(--revenue-modal-edge-opacity);
      transform: translate3d(0, var(--revenue-modal-enter-offset), 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes revenue-modal-out {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    to {
      opacity: var(--revenue-modal-edge-opacity);
      transform: translate3d(0, var(--revenue-modal-enter-offset), 0);
    }
  }

  @media (max-width: 1199px) {
    --revenue-modal-enter-offset: 100%;
    --revenue-modal-edge-opacity: 1;
    width: 100%;
    max-height: 92vh;
    border-radius: 24px 24px 0 0;
    padding: 18px 16px calc(44px + env(safe-area-inset-bottom, 0px));
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CostModalHeader = styled.div`
  position: sticky;
  top: -22px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: -22px -22px 16px;
  padding: 22px 22px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e8ebf2;

  h2 {
    margin: 0;
    color: #121316;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  @media (max-width: 1199px) {
    top: -18px;
    margin: -18px -16px 14px;
    padding: 18px 16px 12px;

    h2 {
      font-size: 17px;
    }
  }
`;

const CostModalCloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: #f4f5f8;
  color: #4b5565;
  cursor: pointer;

  &:hover {
    background: #eceff4;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(36, 48, 87, 0.12);
  }
`;

const CostModalTotal = styled.div`
  display: grid;
  margin-bottom: 18px;

  strong {
    color: var(--primary);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  @media (max-width: 1199px) {
    margin-bottom: 16px;

    strong {
      font-size: 23px;
    }
  }
`;

const CalendarModalWrap = styled.div`
  display: grid;
  gap: 14px;
`;

const CalendarWeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 1199px) {
    gap: 6px;
  }
`;

const CalendarWeekLabel = styled.div`
  display: grid;
  place-items: center;
  color: #5f6b7a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;

  @media (max-width: 1199px) {
    font-size: 11px;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  gap: 8px;

  @media (max-width: 1199px) {
    gap: 6px;
  }
`;

const CalendarWeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 1199px) {
    gap: 6px;
  }
`;

const CalendarDayCard = styled.div<{ $isActive: boolean; $isEmpty?: boolean }>`
  min-height: 60px;
  border-radius: 18px;
  border: 1px solid ${({ $isActive, $isEmpty }) => ($isEmpty ? "transparent" : $isActive ? "#d9e1f2" : "#dde3eb")};
  background: ${({ $isActive, $isEmpty }) => ($isEmpty ? "transparent" : $isActive ? "#ffffff" : "#eef2f6")};
  padding: ${({ $isEmpty }) => ($isEmpty ? "0" : "10px 10px 9px")};
  display: ${({ $isEmpty }) => ($isEmpty ? "block" : "grid")};
  align-content: space-between;
  gap: 10px;

  @media (max-width: 1199px) {
    min-height: 54px;
    border-radius: 14px;
    padding: ${({ $isEmpty }) => ($isEmpty ? "0" : "8px 8px 7px")};
    gap: 8px;
  }
`;

const CalendarDayNumber = styled.div<{ $isActive: boolean }>`
  color: ${({ $isActive }) => ($isActive ? "#3859d9" : "#64748b")};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;

  @media (max-width: 1199px) {
    font-size: 11px;
  }
`;

const CalendarDayCount = styled.div<{ $isActive: boolean }>`
  align-self: end;
  color: ${({ $isActive }) => ($isActive ? "#121316" : "#8a94a6")};
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;

  @media (max-width: 1199px) {
    font-size: 18px;
  }
`;

const CategorySection = styled.section`
  display: grid;
  gap: 12px;
  margin-bottom: 18px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
  }
`;

const CategoryCard = styled(StatusSummaryCard)``;

const CategoryCardHeader = styled.div`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 9px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8ebf2;

  > span {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 10px;
    background: #edf0ff;
    color: var(--primary);

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 1199px) {
    grid-template-columns: 30px minmax(0, 1fr) auto;
    column-gap: 8px;
    padding-bottom: 14px;
    margin-bottom: 14px;

    > span {
      width: 30px;
      height: 30px;
      border-radius: 9px;

      svg {
        width: 15px;
        height: 15px;
      }
    }
  }
`;

const CategoryDetailButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: #f1f3f6;
  color: #121316;
  cursor: pointer;

  &:hover {
    background: #e7ebf0;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(18, 19, 22, 0.12);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 1199px) {
    width: 28px;
    height: 28px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const CategoryCardTitle = styled.div`
  color: #121316;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: capitalize;

  @media (max-width: 1199px) {
    font-size: 14px;
  }
`;

const CategoryEmptyState = styled.div`
  color: #687086;
  font-size: 13px;

  @media (max-width: 1199px) {
    font-size: 12px;
  }
`;

type ProgressGroupDatum = {
  key: string;
  label: string;
  count: number;
};

type CategoryDetailState = {
  title: string;
  items: ProgressGroupDatum[];
  totalCount: number;
  layout?: "list" | "calendar";
};

type SummaryState = {
  totalProfiles: number;
  totalCost: number;
  totalProfit: number;
  initialCost: number;
  processingCost: number;
  waitingCost: number;
  paidCost: number;
  completedCost: number;
  processingProfit: number;
  waitingProfit: number;
  paidProfit: number;
  completedProfit: number;
  serviceCost: number;
  registrationFeeCost: number;
  otherCost: number;
  blackBoxBadgeCost: number;
  otherIncidentalCost: number;
  processing: number;
  waitingForPayment: number;
  paid: number;
  completed: number;
};

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function getRevenueMonths() {
  const months = [8, 9, 10, 11, 12];
  const current = new Date();
  const currentMonth = current.getMonth() + 1;

  if (current.getFullYear() === PROFILE_YEAR && months.indexOf(currentMonth) === -1) {
    months.push(currentMonth);
    months.sort((a, b) => a - b);
  }

  return months.map((month) => ({
    key: `${PROFILE_YEAR}-${String(month).padStart(2, "0")}`,
    label: `Tháng ${month}`,
    year: PROFILE_YEAR,
  }));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function normalizedStatus(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

function titleCaseLabel(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("vi-VN") + part.slice(1))
    .join(" ");
}

function buildProgressGroupData(
  profiles: ProfileRecord[],
  options: readonly string[],
  getValue: (profile: ProfileRecord) => string,
) {
  const counts = new Map<string, number>();

  options.forEach((option) => {
    counts.set(option, 0);
  });

  profiles.forEach((profile) => {
    const value = getValue(profile)?.trim();
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({
      key: label,
      label: titleCaseLabel(label),
      count,
    })) satisfies ProgressGroupDatum[];
}

function getMonthParts(value: string) {
  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  return {
    year: Number.isFinite(year) ? year : PROFILE_YEAR,
    month: Number.isFinite(month) ? month : 1,
  };
}

function formatDateLabel(value: Date) {
  return `${String(value.getDate()).padStart(2, "0")}/${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`;
}

function buildDailyProfileData(profiles: ProfileRecord[], year: number, month: number) {
  const totalDays = new Date(year, month, 0).getDate();
  const counts = new Map<string, number>();

  for (let day = 1; day <= totalDays; day += 1) {
    counts.set(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, 0);
  }

  profiles.forEach((profile) => {
    const createdAt = new Date(profile.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;

    const dayKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
    if (!counts.has(dayKey)) return;
    counts.set(dayKey, (counts.get(dayKey) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([key, count]) => {
    const [entryYear, entryMonth, entryDay] = key.split("-").map(Number);
    const date = new Date(entryYear, entryMonth - 1, entryDay);

    return {
      key,
      label: formatDateLabel(date),
      count,
    };
  }) satisfies ProgressGroupDatum[];
}

function buildCalendarWeeks(items: ProgressGroupDatum[]) {
  if (items.length === 0) return [] as Array<Array<ProgressGroupDatum | null>>;

  const sortedItems = [...items].sort((first, second) => first.key.localeCompare(second.key, "vi"));
  const [firstYear, firstMonth, firstDay] = sortedItems[0].key.split("-").map(Number);
  const firstDate = new Date(firstYear, firstMonth - 1, firstDay);
  const firstWeekday = (firstDate.getDay() + 6) % 7;
  const calendarItems: Array<ProgressGroupDatum | null> = Array.from({ length: firstWeekday }, () => null);

  calendarItems.push(...sortedItems);

  while (calendarItems.length % 7 !== 0) {
    calendarItems.push(null);
  }

  const weeks: Array<Array<ProgressGroupDatum | null>> = [];

  for (let index = 0; index < calendarItems.length; index += 7) {
    weeks.push(calendarItems.slice(index, index + 7));
  }

  return weeks;
}

function buildCustomerProgressData(profiles: ProfileRecord[]) {
  const customerStats = new Map<string, { count: number; firstCreatedAt: number }>();

  profiles.forEach((profile) => {
    const customerName = profile.customerName?.trim();
    if (!customerName) return;
    const createdAt = new Date(profile.createdAt);
    const createdAtTime = Number.isNaN(createdAt.getTime()) ? Number.MAX_SAFE_INTEGER : createdAt.getTime();
    const current = customerStats.get(customerName);

    if (!current) {
      customerStats.set(customerName, { count: 1, firstCreatedAt: createdAtTime });
      return;
    }

    customerStats.set(customerName, {
      count: current.count + 1,
      firstCreatedAt: Math.min(current.firstCreatedAt, createdAtTime),
    });
  });

  return Array.from(customerStats.entries())
    .map(([label, stats]) => ({
      key: label,
      label,
      count: stats.count,
      firstCreatedAt: stats.firstCreatedAt,
    }))
    .sort((first, second) => {
      if (second.count !== first.count) return second.count - first.count;
      if (first.firstCreatedAt !== second.firstCreatedAt) return first.firstCreatedAt - second.firstCreatedAt;
      return first.label.localeCompare(second.label, "vi");
    })
    .map(({ key, label, count }) => ({
      key,
      label,
      count,
    })) satisfies ProgressGroupDatum[];
}

type ProgressSummaryCardProps = {
  title: string;
  items: ProgressGroupDatum[];
  loading: boolean;
  totalCount: number;
  icon: React.ReactNode;
  maxVisibleItems?: number;
  onOpenDetails: () => void;
};

function ProgressSummaryCard({
  title,
  items,
  loading,
  totalCount,
  icon,
  maxVisibleItems,
  onOpenDetails,
}: ProgressSummaryCardProps) {
  const visibleItems = items.filter((item) => item.count > 0).slice(0, maxVisibleItems || items.length);

  return (
    <CategoryCard>
      <CategoryCardHeader>
        <span>{icon}</span>
        <CategoryCardTitle>{title}</CategoryCardTitle>
        <CategoryDetailButton type="button" aria-label={`Xem toàn bộ ${title}`} onClick={onOpenDetails}>
          <ListChevronsUpDown size={16} />
        </CategoryDetailButton>
      </CategoryCardHeader>
      {loading ? (
        <LoadingValue><SpinnerIcon aria-label="Đang tải" size={16} /></LoadingValue>
      ) : visibleItems.length > 0 ? (
        <StatusProgressList>
          {visibleItems.map((item) => {
            const progressWidth = totalCount > 0 ? (item.count / totalCount) * 100 : 0;

            return (
              <StatusProgressItem key={item.key}>
                <StatusProgressRow>
                  <StatusProgressLabel $tone="processing">{item.label}</StatusProgressLabel>
                  <StatusProgressValue>{formatNumber(item.count)}</StatusProgressValue>
                </StatusProgressRow>
                <StatusProgressTrack>
                  <StatusProgressFill $tone="neutral" $width={progressWidth} />
                </StatusProgressTrack>
              </StatusProgressItem>
            );
          })}
        </StatusProgressList>
      ) : (
        <CategoryEmptyState>Chưa có hồ sơ</CategoryEmptyState>
      )}
    </CategoryCard>
  );
}

type RevenueDashboardProps = {
  customerMode?: boolean;
};

export function RevenueDashboard({ customerMode = false }: RevenueDashboardProps) {
  const monthTabs = useMemo(() => getRevenueMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(`${PROFILE_YEAR}-08`);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCostDetailOpen, setIsCostDetailOpen] = useState(false);
  const [isCostDetailClosing, setIsCostDetailClosing] = useState(false);
  const [activeCategoryDetail, setActiveCategoryDetail] = useState<CategoryDetailState | null>(null);
  const [isCategoryDetailClosing, setIsCategoryDetailClosing] = useState(false);

  useEffect(() => {
    const current = new Date();
    if (current.getFullYear() === PROFILE_YEAR) {
      setSelectedMonth(`${PROFILE_YEAR}-${String(current.getMonth() + 1).padStart(2, "0")}`);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProfiles(await profileService.list());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải số liệu doanh thu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfiles(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfiles]);

  const hasModalOpen =
    isCostDetailOpen ||
    isCostDetailClosing ||
    activeCategoryDetail !== null ||
    isCategoryDetailClosing;

  useEffect(() => {
    if (!hasModalOpen) return;

    document.body.classList.add("profile-modal-open");
    return () => document.body.classList.remove("profile-modal-open");
  }, [hasModalOpen]);

  const monthlyProfiles = useMemo(
    () =>
      profiles.filter((profile) => {
        const createdAt = new Date(profile.createdAt);
        return !Number.isNaN(createdAt.getTime()) && monthKey(createdAt) === selectedMonth;
      }),
    [profiles, selectedMonth],
  );

  const customersForMonth = useMemo(
    () => Array.from(new Set(monthlyProfiles.map((profile) => profile.customerName.trim()).filter(Boolean))).sort((first, second) => first.localeCompare(second, "vi")),
    [monthlyProfiles],
  );

  const dashboardProfiles = useMemo(
    () => customerMode
      ? selectedCustomer ? monthlyProfiles.filter((profile) => profile.customerName.trim() === selectedCustomer) : []
      : monthlyProfiles,
    [customerMode, monthlyProfiles, selectedCustomer],
  );

  const summary = useMemo<SummaryState>(() => {
    return dashboardProfiles.reduce(
      (result, profile) => {
        const status = normalizedStatus(profile.status);
        const totalCost = Number(profile.totalCost) || 0;
        const initialCost = Number(profile.initialCost) || 0;
        const calculatedProfit = totalCost - initialCost;
        result.totalProfiles += 1;
        result.totalCost += totalCost;
        result.totalProfit += calculatedProfit;
        result.initialCost += initialCost;
        result.serviceCost += Number(profile.cost) || 0;
        result.registrationFeeCost += Number(profile.registrationFeeCost) || 0;
        result.otherCost += Number(profile.otherCost) || 0;
        result.blackBoxBadgeCost += Number(profile.blackBoxBadgeCost) || 0;
        result.otherIncidentalCost += Number(profile.otherIncidentalCost) || 0;
        if (status === "đang xử lí" || status === "đang xử lý") {
          result.processing += 1;
          result.processingCost += totalCost;
          result.processingProfit += calculatedProfit;
        }
        if (status === "đang chờ thanh toán") {
          result.waitingForPayment += 1;
          result.waitingCost += totalCost;
          result.waitingProfit += calculatedProfit;
        }
        if (status === "đã thanh toán") {
          result.paid += 1;
          result.paidCost += totalCost;
          result.paidProfit += calculatedProfit;
        }
        if (status === "hoàn tất" || status === "đã hoàn tất") {
          result.completed += 1;
          result.completedCost += totalCost;
          result.completedProfit += calculatedProfit;
        }
        return result;
      },
      {
        totalProfiles: 0,
        totalCost: 0,
        totalProfit: 0,
        initialCost: 0,
        processingCost: 0,
        waitingCost: 0,
        paidCost: 0,
        completedCost: 0,
        processingProfit: 0,
        waitingProfit: 0,
        paidProfit: 0,
        completedProfit: 0,
        serviceCost: 0,
        registrationFeeCost: 0,
        otherCost: 0,
        blackBoxBadgeCost: 0,
        otherIncidentalCost: 0,
        processing: 0,
        waitingForPayment: 0,
        paid: 0,
        completed: 0,
      },
    );
  }, [dashboardProfiles]);

  const totalCostBreakdown = useMemo(
    () => [
      { key: "service", label: "Chi Phí Dịch Vụ", value: summary.serviceCost },
      { key: "registration", label: "Lệ Phí Trước Bạ", value: summary.registrationFeeCost },
      { key: "other", label: "Chi Phí Khác", value: summary.otherCost },
      { key: "black-box", label: "Hộp Đen, Phù Hiệu", value: summary.blackBoxBadgeCost },
      { key: "incidental", label: "Phát Sinh Khác", value: summary.otherIncidentalCost },
    ],
    [
      summary.blackBoxBadgeCost,
      summary.otherCost,
      summary.otherIncidentalCost,
      summary.registrationFeeCost,
      summary.serviceCost,
    ],
  );

  const totalCostStatusBreakdown = useMemo(
    () => [
      {
        key: "processing-cost",
        label: "Tiền Đang Xử Lí",
        value: summary.processingCost,
        tone: "processing" as const,
      },
      {
        key: "waiting-cost",
        label: "Tiền Khách Đang Nợ",
        value: summary.waitingCost,
        tone: "waiting" as const,
      },
      {
        key: "paid-cost",
        label: "Tiền Khách Đã Trả",
        value: summary.paidCost,
        tone: "paid" as const,
      },
      {
        key: "completed-cost",
        label: "Tiền Nhận Về Tay",
        value: summary.completedCost,
        tone: "completed" as const,
      },
    ],
    [summary.completedCost, summary.paidCost, summary.processingCost, summary.waitingCost],
  );

  const profitBreakdown = useMemo(
    () => [
      {
        key: "processing-profit",
        label: "Lãi Đang Chờ",
        value: summary.processingProfit,
        tone: "processing" as const,
      },
      {
        key: "waiting-profit",
        label: "Lãi Từ Khách Đang Nợ",
        value: summary.waitingProfit,
        tone: "waiting" as const,
      },
      {
        key: "paid-profit",
        label: "Lãi Từ Khách Đã Trả",
        value: summary.paidProfit,
        tone: "paid" as const,
      },
      {
        key: "completed-profit",
        label: "Tiền Lãi Về Túi",
        value: summary.completedProfit,
        tone: "completed" as const,
      },
    ],
    [summary.completedProfit, summary.paidProfit, summary.processingProfit, summary.waitingProfit],
  );

  const statusProgressItems = useMemo(
    () => [
      { key: "processing", label: "Đang xử lí", count: summary.processing, tone: "processing" as const },
      {
        key: "waiting",
        label: "Chờ thanh toán",
        count: summary.waitingForPayment,
        tone: "waiting" as const,
      },
      { key: "paid", label: "Đã thanh toán", count: summary.paid, tone: "paid" as const },
      { key: "completed", label: "Đã hoàn tất", count: summary.completed, tone: "completed" as const },
    ],
    [summary.completed, summary.paid, summary.processing, summary.totalProfiles, summary.waitingForPayment],
  );

  const vehicleTypeProgressItems = useMemo(
    () => buildProgressGroupData(dashboardProfiles, VEHICLE_TYPES, (profile) => profile.vehicleType),
    [dashboardProfiles],
  );

  const receivingAgencyProgressItems = useMemo(
    () => buildProgressGroupData(dashboardProfiles, RECEIVING_AGENCIES, (profile) => profile.receivingAgency),
    [dashboardProfiles],
  );

  const serviceTypeProgressItems = useMemo(
    () => buildProgressGroupData(dashboardProfiles, SERVICE_TYPES, (profile) => profile.serviceType),
    [dashboardProfiles],
  );

  const selectedMonthParts = useMemo(() => getMonthParts(selectedMonth), [selectedMonth]);

  const dailyProfileProgressItems = useMemo(
    () => buildDailyProfileData(dashboardProfiles, selectedMonthParts.year, selectedMonthParts.month),
    [dashboardProfiles, selectedMonthParts.month, selectedMonthParts.year],
  );

  const topDailyProfileProgressItems = useMemo(
    () =>
      [...dailyProfileProgressItems]
        .filter((item) => item.count > 0)
        .sort((first, second) => {
          if (second.count !== first.count) return second.count - first.count;
          return first.key.localeCompare(second.key, "vi");
        }),
    [dailyProfileProgressItems],
  );

  const customerProgressItems = useMemo(() => buildCustomerProgressData(dashboardProfiles), [dashboardProfiles]);
  const topCustomerProgressItems = useMemo(() => customerProgressItems, [customerProgressItems]);
  const topDailyScale = summary.totalProfiles;
  const topCustomerScale = summary.totalProfiles;
  const dailyProfileCalendarWeeks = useMemo(() => buildCalendarWeeks(dailyProfileProgressItems), [dailyProfileProgressItems]);

  const displayNumber = (value: number) => formatNumber(value);
  const loadingValue = <SpinnerIcon aria-label="Đang tải" size={16} />;
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedCustomer("");
  };
  const openCostDetail = useCallback(() => {
    setIsCostDetailClosing(false);
    setIsCostDetailOpen(true);
  }, []);
  const closeCostDetail = useCallback(() => {
    if (!isCostDetailOpen || isCostDetailClosing) return;
    setIsCostDetailClosing(true);
    window.setTimeout(() => {
      setIsCostDetailOpen(false);
      setIsCostDetailClosing(false);
    }, REVENUE_MODAL_CLOSE_MS);
  }, [isCostDetailClosing, isCostDetailOpen]);
  const openCategoryDetail = useCallback((detail: CategoryDetailState) => {
    setIsCategoryDetailClosing(false);
    setActiveCategoryDetail(detail);
  }, []);
  const closeCategoryDetail = useCallback(() => {
    if (activeCategoryDetail === null || isCategoryDetailClosing) return;
    setIsCategoryDetailClosing(true);
    window.setTimeout(() => {
      setActiveCategoryDetail(null);
      setIsCategoryDetailClosing(false);
    }, REVENUE_MODAL_CLOSE_MS);
  }, [activeCategoryDetail, isCategoryDetailClosing]);
  const currencyValue = (value: number, tone: "primary" | "danger" | "success") => (
    <CurrencyValue $tone={tone}>
      {loading ? (
        <CurrencyLoadingValue>{loadingValue}</CurrencyLoadingValue>
      ) : (
        <>
          <strong>{displayNumber(value)}</strong>
          <span>đ</span>
        </>
      )}
    </CurrencyValue>
  );

  return (
    <AppShell>
      <Header $customerMode={customerMode}>
        <TitleRow>
          <AccountMenu />
          <h1>{customerMode ? "Khách Hàng" : "Doanh Thu"}</h1>
        </TitleRow>
        <HeaderFilters $customerMode={customerMode}>
          <MonthSelectWrap>
            <CalendarIcon>
              <Calendar size={18} />
            </CalendarIcon>
            <MonthSelect
              aria-label="Lọc doanh thu theo tháng"
              value={selectedMonth}
              onChange={(event) => handleMonthChange(event.target.value)}
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
          {customerMode && (
            <CustomerSelectWrap>
              <CalendarIcon>
                <UserStar size={18} />
              </CalendarIcon>
              <MonthSelect
                aria-label="Lọc doanh thu theo khách hàng"
                value={selectedCustomer}
                onChange={(event) => setSelectedCustomer(event.target.value)}
              >
                <option value="" disabled hidden />
                <optgroup label="Chọn Khách Hàng">
                  {customersForMonth.map((customer) => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </optgroup>
              </MonthSelect>
              {!selectedCustomer && <CustomerSelectPlaceholder>Chọn Khách Hàng</CustomerSelectPlaceholder>}
              <DropdownIcon>
                <ChevronDown size={18} />
              </DropdownIcon>
            </CustomerSelectWrap>
          )}
        </HeaderFilters>
      </Header>

      <ContentWrap>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        {customerMode && !selectedCustomer ? (
          <CustomerSelectionPrompt>
            <UserSearch size={26} />
            <span>Chọn Khách Hàng Để Xem Doanh Thu</span>
          </CustomerSelectionPrompt>
        ) : (
          <>
        <SummaryLayout aria-label="Số liệu hồ sơ và doanh thu trong tháng">
          <StatusSummaryCard>
            <StatusTotalWrap>
              <StatusTotalHeader>
                <span><FolderOpen size={18} /></span>
                <StatusTotalLabel>Tổng Hồ Sơ</StatusTotalLabel>
              </StatusTotalHeader>
              {loading ? (
                <LoadingValue>{loadingValue}</LoadingValue>
              ) : (
                <StatusTotalValue>{displayNumber(summary.totalProfiles)}</StatusTotalValue>
              )}
            </StatusTotalWrap>
            <StatusProgressList>
              {statusProgressItems.map((item) => {
                const progressWidth =
                  summary.totalProfiles > 0 ? (item.count / summary.totalProfiles) * 100 : 0;

                return (
                  <StatusProgressItem key={item.key}>
                    <StatusProgressRow>
                      <StatusProgressLabel $tone={item.tone}>{titleCaseLabel(item.label)}</StatusProgressLabel>
                      <StatusProgressValue>
                        {loading ? <SpinnerIcon aria-label="Đang tải" size={16} /> : displayNumber(item.count)}
                      </StatusProgressValue>
                    </StatusProgressRow>
                    <StatusProgressTrack>
                      <StatusProgressFill $tone={item.tone} $width={progressWidth} />
                    </StatusProgressTrack>
                  </StatusProgressItem>
                );
              })}
            </StatusProgressList>
          </StatusSummaryCard>
          <FinancialColumn>
            <MetricCard $tone="primary">
              <span><Calculator size={18} /></span>
              <small>Tổng Tiền Khách Trả Dự Kiến</small>
              <CurrencyValue $tone="primary">
                {loading ? (
                  <CurrencyLoadingValue>{loadingValue}</CurrencyLoadingValue>
                ) : (
                  <>
                    <strong>{displayNumber(summary.totalCost)}</strong>
                    <span>đ</span>
                    <CurrencyInfoButton
                      type="button"
                      aria-label="Xem chi tiết tổng tiền khách trả dự kiến"
                      onClick={openCostDetail}
                    >
                      <Info size={15} />
                    </CurrencyInfoButton>
                  </>
                )}
              </CurrencyValue>
              <MetricDivider />
              <MetricBreakdownList>
                {totalCostStatusBreakdown.map((item) => (
                  <MetricBreakdownItem key={item.key}>
                    <MetricBreakdownRow>
                      <span>{item.label}</span>
                      <strong>{loading ? <SpinnerIcon aria-label="Đang tải" size={14} /> : `${displayNumber(item.value)}đ`}</strong>
                    </MetricBreakdownRow>
                    <MetricBreakdownTrack>
                      <MetricBreakdownFill
                        $tone={item.tone}
                        $width={summary.totalCost > 0 ? (item.value / summary.totalCost) * 100 : 0}
                      />
                    </MetricBreakdownTrack>
                  </MetricBreakdownItem>
                ))}
              </MetricBreakdownList>
            </MetricCard>
          </FinancialColumn>
          <SummaryMetricColumn>
            <MetricCard $tone="danger">
              <MetricSection>
                <span
                  style={{
                    background: getMetricToneBackground("danger"),
                    color: getMetricToneColor("danger"),
                  }}
                >
                  <Calculator size={18} />
                </span>
                <MetricSectionLabel $tone="danger">Tổng Tiền Bỏ Ra</MetricSectionLabel>
                {currencyValue(summary.initialCost, "danger")}
              </MetricSection>
              <MetricDivider />
              <MetricSection $topPadding>
                <span
                  style={{
                    background: getMetricToneBackground("success"),
                    color: getMetricToneColor("success"),
                  }}
                >
                  <TrendingUp size={18} />
                </span>
                <MetricSectionLabel $tone="success">Tổng Tiền Lãi Dự Kiến</MetricSectionLabel>
                {currencyValue(summary.totalProfit, "success")}
              </MetricSection>
              <MetricDivider />
              <MetricBreakdownList>
                {profitBreakdown.map((item) => (
                  <MetricBreakdownItem key={item.key}>
                    <MetricBreakdownRow>
                      <span>{item.label}</span>
                      <strong>{loading ? <SpinnerIcon aria-label="Đang tải" size={14} /> : `${displayNumber(item.value)}đ`}</strong>
                    </MetricBreakdownRow>
                    <MetricBreakdownTrack>
                      <MetricBreakdownFill
                        $tone={item.tone}
                        $width={summary.totalProfit > 0 ? (item.value / summary.totalProfit) * 100 : 0}
                      />
                    </MetricBreakdownTrack>
                  </MetricBreakdownItem>
                ))}
              </MetricBreakdownList>
            </MetricCard>
          </SummaryMetricColumn>
        </SummaryLayout>

        {!customerMode && (
        <CategorySection aria-label="Thống kê theo nhóm">
          <ProgressSummaryCard
            title="Loại Xe"
            items={vehicleTypeProgressItems}
            loading={loading}
            totalCount={summary.totalProfiles}
            icon={<CarFront size={18} />}
            onOpenDetails={() =>
              openCategoryDetail({ title: "Loại Xe", items: vehicleTypeProgressItems, totalCount: summary.totalProfiles })
            }
          />
          <ProgressSummaryCard
            title="Cơ Quan Nhận"
            items={receivingAgencyProgressItems}
            loading={loading}
            totalCount={summary.totalProfiles}
            icon={<Building2 size={18} />}
            onOpenDetails={() =>
              openCategoryDetail({ title: "Cơ Quan Nhận", items: receivingAgencyProgressItems, totalCount: summary.totalProfiles })
            }
          />
          <ProgressSummaryCard
            title="Loại Dịch Vụ"
            items={serviceTypeProgressItems}
            loading={loading}
            totalCount={summary.totalProfiles}
            icon={<Briefcase size={18} />}
            onOpenDetails={() =>
              openCategoryDetail({ title: "Loại Dịch Vụ", items: serviceTypeProgressItems, totalCount: summary.totalProfiles })
            }
          />
          {!customerMode && (
            <>
              <ProgressSummaryCard
                title="Top Hồ Sơ Tháng"
                items={topDailyProfileProgressItems}
                loading={loading}
                totalCount={topDailyScale}
                maxVisibleItems={3}
                icon={<ClockArrowUp size={18} />}
                onOpenDetails={() =>
                  openCategoryDetail({
                    title: "Top Hồ Sơ Tháng",
                    items: dailyProfileProgressItems,
                    totalCount: topDailyScale,
                    layout: "calendar",
                  })
                }
              />
              <ProgressSummaryCard
                title="Top Khách Hàng Tháng"
                items={topCustomerProgressItems}
                loading={loading}
                totalCount={topCustomerScale}
                maxVisibleItems={3}
                icon={<UserStar size={18} />}
                onOpenDetails={() =>
                  openCategoryDetail({
                    title: "Top Khách Hàng Tháng",
                    items: customerProgressItems,
                    totalCount: topCustomerScale,
                    layout: "list",
                  })
                }
              />
            </>
          )}
        </CategorySection>
        )}
        {customerMode && <ProfileManager embedded selectedMonth={selectedMonth} customerName={selectedCustomer} />}
          </>
        )}

        {(isCostDetailOpen || isCostDetailClosing) && (
          <CostModalOverlay $closing={isCostDetailClosing} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeCostDetail()}>
            <CostModalDialog $closing={isCostDetailClosing} role="dialog" aria-modal="true" aria-labelledby="cost-detail-title" onMouseDown={(event) => event.stopPropagation()}>
              <CostModalHeader>
                <h2 id="cost-detail-title">Tổng Tiền Khách Trả Dự Kiến</h2>
                <CostModalCloseButton type="button" aria-label="Đóng chi tiết tổng tiền khách trả dự kiến" onClick={closeCostDetail}>
                  <X size={18} />
                </CostModalCloseButton>
              </CostModalHeader>
              <CostModalTotal>
                <strong>{loading ? <SpinnerIcon aria-label="Đang tải" size={18} /> : `${displayNumber(summary.totalCost)} đ`}</strong>
              </CostModalTotal>
              <MetricBreakdownList>
                {totalCostBreakdown.map((item) => (
                  <MetricBreakdownItem key={item.key}>
                    <MetricBreakdownRow>
                      <span>{item.label}</span>
                      <strong>{loading ? <SpinnerIcon aria-label="Đang tải" size={14} /> : `${displayNumber(item.value)}đ`}</strong>
                    </MetricBreakdownRow>
                    <MetricBreakdownTrack>
                      <MetricBreakdownFill
                        $width={summary.totalCost > 0 ? (item.value / summary.totalCost) * 100 : 0}
                      />
                    </MetricBreakdownTrack>
                  </MetricBreakdownItem>
                ))}
              </MetricBreakdownList>
            </CostModalDialog>
          </CostModalOverlay>
        )}

        {(activeCategoryDetail || isCategoryDetailClosing) && activeCategoryDetail && (
          <CostModalOverlay $closing={isCategoryDetailClosing} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeCategoryDetail()}>
            <CostModalDialog $closing={isCategoryDetailClosing} role="dialog" aria-modal="true" aria-labelledby="category-detail-title" onMouseDown={(event) => event.stopPropagation()}>
              <CostModalHeader>
                <h2 id="category-detail-title">{activeCategoryDetail.title}</h2>
                <CostModalCloseButton type="button" aria-label="Đóng danh sách chi tiết" onClick={closeCategoryDetail}>
                  <X size={18} />
                </CostModalCloseButton>
              </CostModalHeader>
              {activeCategoryDetail.layout === "calendar" ? (
                <CalendarModalWrap>
                  <CalendarWeekHeader>
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => (
                      <CalendarWeekLabel key={label}>{label}</CalendarWeekLabel>
                    ))}
                  </CalendarWeekHeader>
                  <CalendarGrid>
                    {dailyProfileCalendarWeeks.map((week, weekIndex) => (
                      <CalendarWeekRow key={weekIndex}>
                        {week.map((item, dayIndex) =>
                          item ? (
                            <CalendarDayCard key={item.key} $isActive={item.count > 0}>
                              <CalendarDayNumber $isActive={item.count > 0}>{item.label.slice(0, 2)}</CalendarDayNumber>
                              <CalendarDayCount $isActive={item.count > 0}>
                                {item.count > 0 ? displayNumber(item.count) : null}
                              </CalendarDayCount>
                            </CalendarDayCard>
                          ) : (
                            <CalendarDayCard key={`empty-${weekIndex}-${dayIndex}`} $isActive={false} $isEmpty />
                          ),
                        )}
                      </CalendarWeekRow>
                    ))}
                  </CalendarGrid>
                </CalendarModalWrap>
              ) : (
                <MetricBreakdownList>
                  {activeCategoryDetail.items.map((item) => (
                    <MetricBreakdownItem key={item.key}>
                      <MetricBreakdownRow>
                        <span>{item.label}</span>
                        <strong>{loading ? <SpinnerIcon aria-label="Đang tải" size={14} /> : displayNumber(item.count)}</strong>
                      </MetricBreakdownRow>
                      <MetricBreakdownTrack>
                        <MetricBreakdownFill
                          $tone="neutral"
                          $width={activeCategoryDetail.totalCount > 0 ? (item.count / activeCategoryDetail.totalCount) * 100 : 0}
                        />
                      </MetricBreakdownTrack>
                    </MetricBreakdownItem>
                  ))}
                </MetricBreakdownList>
              )}
            </CostModalDialog>
          </CostModalOverlay>
        )}
      </ContentWrap>
    </AppShell>
  );
}
