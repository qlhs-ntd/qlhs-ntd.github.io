"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, FolderOpen } from "lucide-react";
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
    justify-content: center;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 13px 18px;
  }
`;

const Navigation = styled.nav`
  display: grid;
  gap: 7px;

  @media (max-width: 860px) {
    display: flex;
    justify-content: center;
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
      </Sidebar>

      <Main>
        <MainInner>{children}</MainInner>
      </Main>
    </Shell>
  );
}
