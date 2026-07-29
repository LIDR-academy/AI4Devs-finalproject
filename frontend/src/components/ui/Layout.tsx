import type { HTMLAttributes, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

export type ChartCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...rest
}: ChartCardProps) {
  return (
    <div className={`ui-chart-card ${className}`.trim()} {...rest}>
      <div className="ui-chart-card__header">
        <div>
          <h3 className="ui-chart-card__title">{title}</h3>
          {subtitle ? <p className="ui-chart-card__subtitle">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="ui-chart-card__body">{children}</div>
    </div>
  );
}

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      <div className="ui-page-header__text">
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle ? <p className="ui-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export type SidebarItemProps = {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
};

export function SidebarItem({ to, label, icon, end }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `ui-sidebar-item${isActive ? ' ui-sidebar-item--active' : ''}`
      }
    >
      {icon ? <span className="ui-sidebar-item__icon">{icon}</span> : null}
      <span>{label}</span>
    </NavLink>
  );
}
