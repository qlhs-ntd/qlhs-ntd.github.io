import type { Metadata } from "next";
import { ChartNoAxesCombined, Clock3, TrendingUp, WalletCards } from "lucide-react";
import styled from "styled-components";
import { AppShell } from "../components/AppShell";

export const metadata: Metadata = {
  title: "Doanh thu",
};

const Header = styled.header`
  margin-bottom: 28px;

  span {
    color: var(--primary);
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 8px 0 6px;
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

const Cards = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  min-height: 154px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(36, 48, 87, 0.04);

  > span {
    display: grid;
    width: 42px;
    height: 42px;
    margin-bottom: 18px;
    place-items: center;
    border-radius: 13px;
    background: #edf0ff;
    color: var(--primary);
  }

  small {
    display: block;
    margin-bottom: 5px;
    color: var(--muted);
    font-size: 12px;
  }

  strong {
    font-size: 23px;
    letter-spacing: -0.03em;
  }
`;

const EmptyPanel = styled.section`
  display: grid;
  min-height: 360px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 40px 24px;
  box-shadow: var(--shadow);
  text-align: center;

  > div > span {
    display: grid;
    width: 62px;
    height: 62px;
    margin: 0 auto 18px;
    place-items: center;
    border-radius: 19px;
    background: #edf0ff;
    color: var(--primary);
  }

  h2 {
    margin: 0 0 8px;
    font-size: 19px;
  }

  p {
    max-width: 470px;
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.65;
  }
`;

export default function RevenuePage() {
  return (
    <AppShell>
      <Header>
        <span>Tổng quan</span>
        <h1>Doanh thu</h1>
        <p>Theo dõi số liệu kinh doanh theo thời gian.</p>
      </Header>

      <Cards>
        <Card><span><WalletCards size={20} /></span><small>Doanh thu tháng này</small><strong>—</strong></Card>
        <Card><span><TrendingUp size={20} /></span><small>Tăng trưởng</small><strong>—</strong></Card>
        <Card><span><Clock3 size={20} /></span><small>Cập nhật gần nhất</small><strong>Chưa có</strong></Card>
      </Cards>

      <EmptyPanel>
        <div>
          <span><ChartNoAxesCombined size={28} /></span>
          <h2>Trang doanh thu đã sẵn sàng</h2>
          <p>Phần này đang để trống ở phiên bản cơ bản. Khi có cấu trúc dữ liệu doanh thu, biểu đồ và báo cáo sẽ được kết nối vào đây.</p>
        </div>
      </EmptyPanel>
    </AppShell>
  );
}

