"use client";

import {
  BadgeCheck,
  Calculator,
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
  gap: 24px;
  margin-bottom: 18px;

  h1 {
    margin: 0;
    color: var(--ink);
    font-size: clamp(22px, 2.7vw, 30px);
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;

    h1 {
      font-size: 19px;
      text-align: center;
    }
  }
`;

const MonthSelectWrap = styled.div`
  position: relative;
  width: 150px;

  @media (max-width: 640px) {
    width: 100%;
    margin-top: 8px;
  }
`;

const MonthSelect = styled.select`
  width: 100%;
  height: 42px;
  appearance: none;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
  padding: 0 36px 0 14px;
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
  column-gap: 14px;
  row-gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetricCard = styled.article<{
  $tone: "primary" | "danger" | "success" | "warning" | "violet";
  $desktopSpan: number;
  $mobileSpan: number;
  $mobileOrder: number;
}>`
  grid-column: span ${({ $desktopSpan }) => $desktopSpan};
  min-height: 154px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  > span {
    display: grid;
    width: 42px;
    height: 42px;
    margin-bottom: 18px;
    place-items: center;
    border-radius: 13px;
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
  }

  small {
    display: block;
    margin-bottom: 5px;
    color: #687086;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.4;
    text-transform: uppercase;
  }

  strong {
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
    padding: 12.5px;
    min-height: 139px;
  }
`;

const CurrencyValue = styled.div<{ $tone: "danger" | "success" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  strong {
    color: var(--ink);
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  span {
    display: inline-grid;
    min-width: 38px;
    height: 25px;
    place-items: center;
    border-radius: 8px;
    background: ${({ $tone }) => ($tone === "danger" ? "#fff1f3" : "#e9f8ef")};
    padding: 0 7px;
    color: ${({ $tone }) => ($tone === "danger" ? "var(--danger)" : "#217448")};
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0;
    line-height: 1;
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

  const displayNumber = (value: number) => loading ? "—" : formatNumber(value);

  return (
    <AppShell>
      <Header>
        <h1>Doanh thu 2026</h1>
        <MonthSelectWrap>
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
        <MetricCard $tone="primary" $desktopSpan={4} $mobileSpan={1} $mobileOrder={3}><span><FolderOpen size={20} /></span><small>Tổng hồ sơ</small><strong>{displayNumber(summary.totalProfiles)}</strong></MetricCard>
        <MetricCard $tone="danger" $desktopSpan={4} $mobileSpan={2} $mobileOrder={1}><span><Calculator size={20} /></span><small>Tổng chi phí</small><CurrencyValue $tone="danger"><strong>{displayNumber(summary.totalCost)}</strong>{!loading && <span>VNĐ</span>}</CurrencyValue></MetricCard>
        <MetricCard $tone="success" $desktopSpan={4} $mobileSpan={2} $mobileOrder={2}><span><TrendingUp size={20} /></span><small>Tổng lợi nhuận</small><CurrencyValue $tone="success"><strong>{displayNumber(summary.totalProfit)}</strong>{!loading && <span>VNĐ</span>}</CurrencyValue></MetricCard>
        <MetricCard $tone="warning" $desktopSpan={3} $mobileSpan={1} $mobileOrder={4}><span><Loader className="spin" size={20} /></span><small>Đang xử lí</small><strong>{displayNumber(summary.processing)}</strong></MetricCard>
        <MetricCard $tone="violet" $desktopSpan={3} $mobileSpan={1} $mobileOrder={5}><span><Clock size={20} /></span><small>Chờ thanh toán</small><strong>{displayNumber(summary.waitingForPayment)}</strong></MetricCard>
        <MetricCard $tone="primary" $desktopSpan={3} $mobileSpan={1} $mobileOrder={6}><span><BadgeCheck size={20} /></span><small>Đã thanh toán</small><strong>{displayNumber(summary.paid)}</strong></MetricCard>
        <MetricCard $tone="success" $desktopSpan={3} $mobileSpan={1} $mobileOrder={7}><span><CheckCircle2 size={20} /></span><small>Đã hoàn tất</small><strong>{displayNumber(summary.completed)}</strong></MetricCard>
      </MetricsGrid>
    </AppShell>
  );
}
