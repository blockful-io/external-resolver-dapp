import { LeftChevronSVG, Typography } from "@ensdomains/thorin";

interface BackButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const BackButton = ({ onClick, disabled }: BackButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-start gap-2 rounded-lg py-2 pr-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      <LeftChevronSVG className="h-4 w-4 text-blue-500" />
      <Typography fontVariant="bodyBold" color="blue">
        Back
      </Typography>
    </button>
  );
};
