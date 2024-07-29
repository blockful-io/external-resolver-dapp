import cc from "classcat";
import Link from "next/link";
import { HeaderLinkInterface } from "./DappHeader";

interface HeaderLinkProps extends HeaderLinkInterface {
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
        "flex items-center h-full px-3 gap-2 font-medium hover:bg-gray-50 text-black transition-colors duration-300",
        { "border-blue-500 border-b-2 text-blue-500": isActive },
      ])}
      href={href}
    >
      <Icon />
      {label}
    </Link>
  );
};
