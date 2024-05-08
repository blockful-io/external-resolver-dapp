import { Button, RightChevronSVG } from "@ensdomains/thorin";

interface NextButtonProps {
  onClick: () => void;
}

const NextButton = ({ onClick }: NextButtonProps) => {
  return (
    <div>
      <Button onClick={onClick}>
        <div className="flex items-center justify-center gap-2">
          Next
          <RightChevronSVG />
        </div>
      </Button>
    </div>
  );
};

export default NextButton;
