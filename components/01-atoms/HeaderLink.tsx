import cc from "classcat";
import Link, { LinkProps } from "next/link";

interface HeaderLinkProps extends LinkProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

export const HeaderLink = ({
  icon: Icon,
  label,
  isActive,
  href,
}: HeaderLinkProps) => {
  return (
    <Link
      className={cc([
        "flex items-center h-full px-3 gap-2 font-medium hover:bg-gray-50 transition-colors duration-300",
        { "border-blue-500 border-b-2 text-blue-500": isActive },
      ])}
      href={href}
    >
      <Icon />
      {label}
    </Link>
  );
};
