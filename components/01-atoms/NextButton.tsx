import { Button, RightChevronSVG } from "@ensdomains/thorin";

interface NextButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const NextButton = ({ onClick, disabled = false }: NextButtonProps) => {
  return (
    <div>
      <Button onClick={onClick} disabled={disabled}>
        <div className="flex items-center justify-center gap-2">
          Next
          <RightChevronSVG />
        </div>
      </Button>
    </div>
  );
};

export default NextButton;
