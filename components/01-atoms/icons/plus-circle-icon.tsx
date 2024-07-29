import { SVGProps } from "react";

export const PlusCircleIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_9039_3137)">
        <path
          d="M8 3.66667C8.55229 3.66667 9 4.11438 9 4.66667V7H11.3333C11.8856 7 12.3333 7.44772 12.3333 8C12.3333 8.55229 11.8856 9 11.3333 9H9V11.3333C9 11.8856 8.55229 12.3333 8 12.3333C7.44772 12.3333 7 11.8856 7 11.3333V9H4.66667C4.11438 9 3.66667 8.55229 3.66667 8C3.66667 7.44772 4.11438 7 4.66667 7H7V4.66667C7 4.11438 7.44772 3.66667 8 3.66667Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_9039_3137">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
