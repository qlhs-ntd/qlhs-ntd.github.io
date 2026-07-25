"use client";

import {
  BadgeCheck,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  FolderOpen,
  Loader,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { profileService, type ProfileRecord } from "../lib/profiles";
import { AppShell } from "./AppShell";

const PROFILE_YEAR = 2026;

const Header = styled.header`
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

  @media (max-width: 860px) {
    gap: 12px;

    h1 {
      font-size: 18px;
    }
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

const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 10px;
  row-gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
`;

const MetricCard = styled.article<{
  $tone: "primary" | "danger" | "success" | "warning" | "violet";
  $desktopSpan: number;
  $mobileSpan: number;
  $mobileOrder: number;
}>`
  display: grid;
  grid-column: span ${({ $desktopSpan }) => $desktopSpan};
  grid-template-columns: 32px minmax(0, 1fr);
  align-content: start;
  align-items: center;
  column-gap: 9px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 16px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  > span {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 10px;
    background: ${({ $tone }) =>
      $tone === "danger"
        ? "#fff1f3"
        : $tone === "success"
          ? "#e9f8ef"
          : $tone === "warning"
            ? "#fff6d9"
            : $tone === "violet"
              ? "#f1edff"
              : "#edf0ff"};
    color: ${({ $tone }) =>
      $tone === "danger"
        ? "var(--danger)"
        : $tone === "success"
          ? "#217448"
          : $tone === "warning"
            ? "#a66f00"
            : $tone === "violet"
              ? "#7656c9"
              : "var(--primary)"};

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

  @media (max-width: 980px) {
    grid-column: span 1;
  }

  @media (max-width: 560px) {
    grid-column: span ${({ $mobileSpan }) => $mobileSpan};
    order: ${({ $mobileOrder }) => $mobileOrder};
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
      color: #687086;
      font-size: 11px;
      line-height: 1.25;
    }

    strong {
      margin-top: 10px;
      font-size: 18px;
    }
  }
`;

const DesktopMetricLabel = styled.span`
  display: inline;

  @media (max-width: 560px) {
    display: none;
  }
`;

const MobileMetricLabel = styled.span`
  display: none;

  @media (max-width: 560px) {
    display: inline;
  }
`;

const CurrencyValue = styled.div<{ $tone: "danger" | "success" }>`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;

  strong {
    margin-top: 0;
    color: var(--ink);
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  span {
    display: inline;
    color: var(--ink);
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  @media (max-width: 560px) {
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
  gap: 7px;
  margin-top: 14px;
  color: #687086;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1.2;

  svg {
    width: 16px;
    height: 16px;
    animation: revenue-value-spin 850ms linear infinite;
  }

  @keyframes revenue-value-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 560px) {
    gap: 6px;
    margin-top: 10px;
    font-size: 12px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const CurrencyLoadingValue = styled(LoadingValue)`
  margin-top: 0;
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

export function RevenueDashboard() {
  const monthTabs = useMemo(() => getRevenueMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(`${PROFILE_YEAR}-08`);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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



  const summary = useMemo(() => {
    const monthlyProfiles = profiles.filter((profile) => {
      const createdAt = new Date(profile.createdAt);
      return !Number.isNaN(createdAt.getTime()) && monthKey(createdAt) === selectedMonth;
    });

    return monthlyProfiles.reduce(
      (result, profile) => {
        const status = normalizedStatus(profile.status);
        result.totalProfiles += 1;
        result.totalCost += Number(profile.totalCost) || 0;
        result.totalProfit += Number(profile.profit) || 0;
        if (status === "đang xử lí" || status === "đang xử lý") result.processing += 1;
        if (status === "đang chờ thanh toán") result.waitingForPayment += 1;
        if (status === "đã thanh toán") result.paid += 1;
        if (status === "hoàn tất" || status === "đã hoàn tất") result.completed += 1;
        return result;
      },
      {
        totalProfiles: 0,
        totalCost: 0,
        totalProfit: 0,
        processing: 0,
        waitingForPayment: 0,
        paid: 0,
        completed: 0,
      },
    );
  }, [profiles, selectedMonth]);

  const displayNumber = (value: number) => formatNumber(value);
  const loadingValue = <><Loader aria-hidden="true" size={16} />Đang tải</>;
  const metricValue = (value: number) =>
    loading ? <LoadingValue>{loadingValue}</LoadingValue> : <strong>{displayNumber(value)}</strong>;
  const currencyValue = (value: number, tone: "danger" | "success") => (
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
      <Header>
        <h1>Doanh Thu</h1>
        <MonthSelectWrap>
          <CalendarIcon>
            <Calendar size={18} />
          </CalendarIcon>
          <MonthSelect
            aria-label="Lọc doanh thu theo tháng"
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

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

      <MetricsGrid aria-label="Số liệu hồ sơ và doanh thu trong tháng">
        <MetricCard $tone="danger" $desktopSpan={4} $mobileSpan={2} $mobileOrder={1}><span><Calculator size={18} /></span><small><DesktopMetricLabel>Chi Phí Khách Trả</DesktopMetricLabel><MobileMetricLabel>Chi Phí</MobileMetricLabel></small>{currencyValue(summary.totalCost, "danger")}</MetricCard>
        <MetricCard $tone="success" $desktopSpan={4} $mobileSpan={2} $mobileOrder={2}><span><TrendingUp size={18} /></span><small><DesktopMetricLabel>Lợi Nhuận Thu Về</DesktopMetricLabel><MobileMetricLabel>Lợi Nhuận</MobileMetricLabel></small>{currencyValue(summary.totalProfit, "success")}</MetricCard>
        <MetricCard $tone="primary" $desktopSpan={4} $mobileSpan={2} $mobileOrder={3}><span><FolderOpen size={18} /></span><small><DesktopMetricLabel>Tổng hồ sơ</DesktopMetricLabel><MobileMetricLabel>Hồ Sơ</MobileMetricLabel></small>{metricValue(summary.totalProfiles)}</MetricCard>
        <MetricCard $tone="warning" $desktopSpan={3} $mobileSpan={1} $mobileOrder={4}><span><Loader size={18} /></span><small>Đang xử lí</small>{metricValue(summary.processing)}</MetricCard>
        <MetricCard $tone="violet" $desktopSpan={3} $mobileSpan={1} $mobileOrder={5}><span><Clock size={18} /></span><small>Chờ thanh toán</small>{metricValue(summary.waitingForPayment)}</MetricCard>
        <MetricCard $tone="primary" $desktopSpan={3} $mobileSpan={1} $mobileOrder={6}><span><BadgeCheck size={18} /></span><small>Đã thanh toán</small>{metricValue(summary.paid)}</MetricCard>
        <MetricCard $tone="success" $desktopSpan={3} $mobileSpan={1} $mobileOrder={7}><span><CheckCircle2 size={18} /></span><small>Đã hoàn tất</small>{metricValue(summary.completed)}</MetricCard>
      </MetricsGrid>
    </AppShell>
  );
}
