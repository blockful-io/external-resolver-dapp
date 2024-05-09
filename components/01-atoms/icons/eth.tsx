import { SVGProps } from "react";

const EthIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="24"
      viewBox="0 0 15 24"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_8498_2099)">
        <path
          d="M7.36609 0L7.20508 0.546928V16.4161L7.36609 16.5767L14.7322 12.2225L7.36609 0Z"
          fill="#343434"
        />
        <path
          d="M7.36633 0L0 12.2225L7.36633 16.5767V8.87428V0Z"
          fill="#8C8C8C"
        />
        <path
          d="M7.36614 17.9714L7.27539 18.082V23.7349L7.36614 23.9998L14.7368 13.6194L7.36614 17.9714Z"
          fill="#3C3C3B"
        />
        <path
          d="M7.36633 23.9998V17.9714L0 13.6194L7.36633 23.9998Z"
          fill="#8C8C8C"
        />
        <path
          d="M7.36621 16.5767L14.7324 12.2225L7.36621 8.87427V16.5767Z"
          fill="#141414"
        />
        <path
          d="M0 12.2225L7.36633 16.5767V8.87427L0 12.2225Z"
          fill="#393939"
        />
      </g>
      <defs>
        <clipPath id="clip0_8498_2099">
          <rect width="14.737" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default EthIcon;
