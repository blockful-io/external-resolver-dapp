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
      className="flex items-center justify-start py-2 pr-2 gap-2 rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      <LeftChevronSVG className="text-blue-500 w-4 h-4" />
      <Typography fontVariant="bodyBold" color="blue">
        Back
      </Typography>
    </button>
  );
};
