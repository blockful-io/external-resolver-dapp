import cc from "classcat";
import Link from "next/link";
import { HeaderLinkInterface } from "../organisms/DappHeader";

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
        "flex h-full items-center gap-2 px-3 font-medium text-black transition-colors duration-300 hover:bg-gray-50",
        { "border-b-2 border-blue-500 text-blue-500": isActive },
      ])}
      href={href}
    >
      <Icon />
      {label}
    </Link>
  );
};
