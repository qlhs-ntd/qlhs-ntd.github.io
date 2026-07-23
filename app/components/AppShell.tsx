"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, Files, FolderOpen, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import styled from "styled-components";

const Shell = styled.div`
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  display: flex;
  width: 244px;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.88);
  padding: 28px 20px 22px;
  backdrop-filter: blur(18px);

  @media (max-width: 860px) {
    inset: 0 0 auto;
    width: auto;
    height: 76px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 13px 18px;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
  text-decoration: none;
`;

const BrandMark = styled.span`
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: linear-gradient(145deg, #4969e5, #2946bd);
  color: white;
  box-shadow: 0 10px 24px rgba(56, 89, 217, 0.28);
`;

const BrandText = styled.span`
  display: grid;
  gap: 2px;

  strong {
    font-size: 15px;
    letter-spacing: -0.02em;
  }

  small {
    color: var(--muted);
    font-size: 11px;
  }

  @media (max-width: 520px) {
    small {
      display: none;
    }
  }
`;

const Navigation = styled.nav`
  display: grid;
  gap: 7px;
  margin-top: 52px;

  @media (max-width: 860px) {
    display: flex;
    margin-top: 0;
  }
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  border-radius: 13px;
  padding: 0 14px;
  background: ${({ $active }) => ($active ? "#edf0ff" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--primary)" : "#5f6779")};
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: 150ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#edf0ff" : "#f3f4f8")};
    color: ${({ $active }) => ($active ? "var(--primary)" : "var(--ink)")};
  }

  @media (max-width: 860px) {
    min-height: 44px;
    padding: 0 13px;

    span {
      display: none;
    }
  }
`;

const SidebarNote = styled.div`
  margin-top: auto;
  border: 1px solid #e5e8f6;
  border-radius: 16px;
  background: #f8f9ff;
  padding: 15px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;

  svg {
    margin-bottom: 9px;
    color: var(--primary);
  }

  @media (max-width: 860px) {
    display: none;
  }
`;

const Main = styled.main`
  min-height: 100vh;
  margin-left: 244px;
  padding: 46px clamp(24px, 5vw, 72px) 72px;

  @media (max-width: 860px) {
    margin-left: 0;
    padding: 108px 20px 56px;
  }

  @media (max-width: 520px) {
    padding-inline: 14px;
  }
`;

const MainInner = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
`;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Shell>
      <Sidebar>
        <Brand href="/" aria-label="Về trang danh sách hồ sơ">
          <BrandMark>
            <Files size={21} strokeWidth={2.2} />
          </BrandMark>
          <BrandText>
            <strong>Hồ Sơ Việt</strong>
            <small>Quản lý tập trung</small>
          </BrandText>
        </Brand>

        <Navigation aria-label="Điều hướng chính">
          <NavItem href="/" $active={pathname === "/"} aria-current={pathname === "/" ? "page" : undefined}>
            <FolderOpen size={19} />
            <span>Hồ sơ</span>
          </NavItem>
          <NavItem
            href="/doanh-thu"
            $active={pathname === "/doanh-thu"}
            aria-current={pathname === "/doanh-thu" ? "page" : undefined}
          >
            <ChartNoAxesCombined size={19} />
            <span>Doanh thu</span>
          </NavItem>
        </Navigation>

        <SidebarNote>
          <Sparkles size={18} />
          Dữ liệu hồ sơ có thể đồng bộ trực tiếp với Google Sheets qua Apps Script.
        </SidebarNote>
      </Sidebar>

      <Main>
        <MainInner>{children}</MainInner>
      </Main>
    </Shell>
  );
}

