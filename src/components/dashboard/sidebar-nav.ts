export type SidebarIconName =
  | "Home"
  | "GraduationCap"
  | "Calendar"
  | "ClipboardList"
  | "Megaphone"
  | "Users"
  | "CalendarDays"
  | "BookOpen"
  | "CheckSquare"
  | "BarChart3"
  | "Settings";

export type SidebarItem = {
  key: string;
  label: string;
  href: string;
  iconName: SidebarIconName;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "overview", label: "Overview", href: "/", iconName: "Home" },
  {
    key: "grades",
    label: "Grades",
    href: "/grades",
    iconName: "GraduationCap",
  },
  {
    key: "schedule",
    label: "Schedule",
    href: "/schedule",
    iconName: "Calendar",
  },
  {
    key: "assignments",
    label: "Assignments",
    href: "/assignments",
    iconName: "ClipboardList",
  },
  {
    key: "announcements",
    label: "Announcements",
    href: "/announcements",
    iconName: "Megaphone",
  },
  { key: "clubs", label: "Clubs", href: "/clubs", iconName: "Users" },
  {
    key: "calendar",
    label: "Calendar",
    href: "/calendar",
    iconName: "CalendarDays",
  },
  {
    key: "resources",
    label: "Resources",
    href: "/resources",
    iconName: "BookOpen",
  },
  {
    key: "attendance",
    label: "Attendance",
    href: "/attendance",
    iconName: "CheckSquare",
  },
  {
    key: "powerschool",
    label: "PowerSchool",
    href: "/powerschool",
    iconName: "BarChart3",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    iconName: "Settings",
  },
];
