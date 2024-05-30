import { LeftChevronSVG, Typography } from "@ensdomains/thorin";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-start py-2 pr-2 gap-2 rounded-lg hover:bg-gray-200"
    >
      <LeftChevronSVG className="text-blue-500 w-4 h-4" />
      <Typography fontVariant="bodyBold" color="blue">
        Back
      </Typography>
    </button>
  );
};
