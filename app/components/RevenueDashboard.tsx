"use client";

import type { ApexOptions } from "apexcharts";
import {
  Calculator,
  Calendar,
  ChevronDown,
  FolderOpen,
  Loader,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
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

const PROFILE_YEAR = 2026;
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

const ContentWrap = styled.div`
  width: 100%;
  max-width: 767px;
  margin: 0 auto;
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
`;

const FinancialColumn = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

type MetricTone = "primary" | "danger" | "success" | "warning" | "violet";
type StatusTone = "processing" | "waiting" | "paid" | "completed";

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

  @media (max-width: 560px) {
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

const StatusSummaryCard = styled.article`
  border: 1px solid #eceef3;
  border-radius: 24px;
  background: #ffffff;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  @media (max-width: 560px) {
    padding: 16px 14px;
  }
`;

const StatusTotalWrap = styled.div`
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8ebf2;

  @media (max-width: 560px) {
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

  @media (max-width: 560px) {
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

  @media (max-width: 560px) {
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

  @media (max-width: 560px) {
    margin-top: 8px;
    font-size: 18px;
  }
`;

const StatusProgressList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const StatusProgressItem = styled.div`
  display: grid;
  gap: 9px;
`;

const StatusProgressLabel = styled.div<{ $tone: StatusTone }>`
  color: #121316;
  font-size: 15px;
  font-weight: ${({ $tone }) => ($tone === "processing" || $tone === "waiting" ? 700 : 600)};
  letter-spacing: -0.03em;

  @media (max-width: 560px) {
    font-size: 14px;
  }
`;

const StatusProgressRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;

  @media (max-width: 560px) {
    gap: 12px;
  }
`;

const StatusProgressTrack = styled.div`
  position: relative;
  width: 100%;
  max-width: 660px;
  height: 13px;
  justify-self: start;
  border-radius: 999px;
  background: #eef0f4;
  overflow: hidden;

  @media (max-width: 560px) {
    max-width: none;
    height: 12px;
  }
`;

const StatusProgressFill = styled.div<{ $tone: StatusTone; $width: number }>`
  width: ${({ $width }) => `${$width}%`};
  min-width: ${({ $width }) => ($width > 0 ? "10px" : "0")};
  height: 100%;
  border-radius: 999px;
  background: ${({ $tone }) =>
    $tone === "processing"
      ? "#f0a018"
      : $tone === "waiting"
        ? "#7b61ff"
        : $tone === "paid"
          ? "#3859d9"
          : "#24a36a"};
`;

const StatusProgressValue = styled.strong`
  color: #121316;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;

  @media (max-width: 560px) {
    font-size: 16px;
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
  gap: 4px;
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
  margin-top: 14px;
  color: #687086;

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
    margin-top: 10px;

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

const ChartsSection = styled.section`
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
`;

const ChartCard = styled.article`
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  @media (max-width: 560px) {
    padding: 16px;
  }
`;

const ChartTitle = styled.h2`
  margin: 0 0 14px;
  color: var(--ink);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: capitalize;

  @media (max-width: 560px) {
    font-size: 14px;
  }
`;

const ChartScrollArea = styled.div`
  width: 100%;
`;

const ChartViewport = styled.div`
  width: 100%;
  height: 288px;

  @media (max-width: 560px) {
    height: 260px;
  }
`;

const ChartEmptyState = styled.div`
  display: flex;
  height: 288px;
  align-items: center;
  justify-content: center;
  color: #687086;
  font-size: 14px;

  @media (max-width: 560px) {
    height: 260px;
    font-size: 13px;
  }
`;

type ChartDatum = {
  label: string;
  count: number;
  tooltipLabel: string;
  breakdown?: Array<{ label: string; count: number }>;
  hidden?: boolean;
};

type SummaryState = {
  totalProfiles: number;
  totalCost: number;
  totalProfit: number;
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

function buildChartData(
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

  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

function buildTopChartData(
  profiles: ProfileRecord[],
  options: readonly string[],
  getValue: (profile: ProfileRecord) => string,
  topCount: number,
) {
  const data = buildChartData(profiles, options, getValue).sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.label.localeCompare(right.label, "vi");
  });

  const topItems = data
    .filter((item) => item.count > 0)
    .slice(0, topCount)
    .map((item) => ({
    label: titleCaseLabel(item.label),
    count: item.count,
    tooltipLabel: titleCaseLabel(item.label),
    }));

  const topLabels = new Set(topItems.map((item) => item.tooltipLabel));
  const remaining = data.filter((item) => !topLabels.has(titleCaseLabel(item.label)));
  const remainingCount = remaining.reduce((sum, item) => sum + item.count, 0);

  return [
    ...topItems,
    {
      label: "Còn Lại",
      count: remainingCount,
      tooltipLabel: "Còn Lại",
      breakdown: remaining
        .filter((item) => item.count > 0)
        .map((item) => ({
          label: titleCaseLabel(item.label),
          count: item.count,
        })),
    },
  ] satisfies ChartDatum[];
}

function titleCaseLabel(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("vi-VN") + part.slice(1))
    .join(" ");
}

function truncateChartLabel(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function RevenueDashboard() {
  const monthTabs = useMemo(() => getRevenueMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(`${PROFILE_YEAR}-08`);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();

    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const monthlyProfiles = useMemo(
    () =>
      profiles.filter((profile) => {
        const createdAt = new Date(profile.createdAt);
        return !Number.isNaN(createdAt.getTime()) && monthKey(createdAt) === selectedMonth;
      }),
    [profiles, selectedMonth],
  );

  const summary = useMemo<SummaryState>(() => {
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
  }, [monthlyProfiles]);

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

  const chartTopCount = isDesktop ? 5 : 3;

  const vehicleTypeChartData = useMemo(
    () => buildTopChartData(monthlyProfiles, VEHICLE_TYPES, (profile) => profile.vehicleType, chartTopCount),
    [chartTopCount, monthlyProfiles],
  );

  const receivingAgencyChartData = useMemo(
    () =>
      buildTopChartData(monthlyProfiles, RECEIVING_AGENCIES, (profile) => profile.receivingAgency, chartTopCount),
    [chartTopCount, monthlyProfiles],
  );

  const serviceTypeChartData = useMemo(
    () => buildTopChartData(monthlyProfiles, SERVICE_TYPES, (profile) => profile.serviceType, chartTopCount),
    [chartTopCount, monthlyProfiles],
  );

  const renderBarChart = (title: string, data: ChartDatum[]) => {
    const targetSlotCount = isDesktop ? 6 : 4;
    const displayData =
      data.length >= targetSlotCount
        ? data
        : [
            ...data,
            ...Array.from({ length: targetSlotCount - data.length }, (_, index) => ({
              label: `__empty_${index}`,
              count: 0,
              tooltipLabel: "",
              hidden: true,
            })),
          ];

    const options: ApexOptions = {
      chart: {
        type: "bar",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { easing: "easeinout", speed: 360 },
      },
      colors: ["#2563eb"],
      dataLabels: {
        enabled: true,
        offsetY: -12,
        background: {
          enabled: true,
          backgroundColor: "#ffffff",
          foreColor: "#2563eb",
          borderRadius: 8,
          padding: 6,
          opacity: 1,
          dropShadow: {
            enabled: false,
          },
        },
        style: {
          colors: ["#2563eb"],
          fontSize: isDesktop ? "15px" : "12px",
          fontWeight: "700",
        },
        formatter: (value, opts) =>
          opts && displayData[opts.dataPointIndex]?.hidden ? "" : `${value ?? 0}`,
      },
      grid: {
        borderColor: "#e4e7ef",
        strokeDashArray: 3,
        padding: {
          top: 18,
        },
      },
      legend: { show: false },
      plotOptions: {
        bar: {
          borderRadius: isDesktop ? 10 : 8,
          borderRadiusApplication: "around",
          columnWidth: isDesktop ? "46%" : "44%",
          dataLabels: {
            position: "top",
          },
        },
      },
      states: {
        active: { filter: { type: "none" } },
        hover: { filter: { type: "none" } },
      },
      stroke: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      xaxis: {
        categories: displayData.map((item) => (item.hidden ? "" : titleCaseLabel(item.label))),
        labels: {
          rotate: 0,
          hideOverlappingLabels: !isDesktop,
          trim: false,
          formatter: (value) => {
            const label = String(value);
            return isDesktop ? label : truncateChartLabel(label, 11);
          },
          style: {
            colors: "#121316",
            fontSize: isDesktop ? "11px" : "10px",
            fontWeight: 700,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        show: false,
        min: 0,
        forceNiceScale: true,
        decimalsInFloat: 0,
        labels: { show: false },
      },
    };
    const series = [
      {
        name: "Số lượng",
        data: displayData.map((item) => (item.hidden ? null : item.count)),
      },
    ];

    return (
      <ChartCard>
        <ChartTitle>{titleCaseLabel(title)}</ChartTitle>
        {loading ? (
          <ChartEmptyState>
            <LoadingValue>{loadingValue}</LoadingValue>
          </ChartEmptyState>
        ) : (
          <ChartScrollArea>
            <ChartViewport>
              <ReactApexChart options={options} series={series} type="bar" height="100%" width="100%" />
            </ChartViewport>
          </ChartScrollArea>
        )}
      </ChartCard>
    );
  };

  const displayNumber = (value: number) => formatNumber(value);
  const loadingValue = <Loader aria-label="Đang tải" size={16} />;
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

      <ContentWrap>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        <SummaryLayout aria-label="Số liệu hồ sơ và doanh thu trong tháng">
          <FinancialColumn>
            <MetricCard $tone="danger"><span><Calculator size={18} /></span><small><DesktopMetricLabel>Chi Phí Khách Trả</DesktopMetricLabel><MobileMetricLabel>Chi Phí</MobileMetricLabel></small>{currencyValue(summary.totalCost, "danger")}</MetricCard>
            <MetricCard $tone="success"><span><TrendingUp size={18} /></span><small><DesktopMetricLabel>Lợi Nhuận Thu Về</DesktopMetricLabel><MobileMetricLabel>Lợi Nhuận</MobileMetricLabel></small>{currencyValue(summary.totalProfit, "success")}</MetricCard>
          </FinancialColumn>
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
                    <StatusProgressLabel $tone={item.tone}>{titleCaseLabel(item.label)}</StatusProgressLabel>
                    <StatusProgressRow>
                      <StatusProgressTrack>
                        <StatusProgressFill $tone={item.tone} $width={progressWidth} />
                      </StatusProgressTrack>
                      <StatusProgressValue>
                        {loading ? <Loader aria-label="Đang tải" size={16} /> : displayNumber(item.count)}
                      </StatusProgressValue>
                    </StatusProgressRow>
                  </StatusProgressItem>
                );
              })}
            </StatusProgressList>
          </StatusSummaryCard>
        </SummaryLayout>

        <ChartsSection aria-label="Biểu đồ thống kê theo nhóm">
          {renderBarChart("loại xe", vehicleTypeChartData)}
          {renderBarChart("cơ quan nhận", receivingAgencyChartData)}
          {renderBarChart("loại dịch vụ", serviceTypeChartData)}
        </ChartsSection>
      </ContentWrap>
    </AppShell>
  );
}
