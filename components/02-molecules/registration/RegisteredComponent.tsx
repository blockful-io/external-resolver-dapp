import { BackButton } from "@/components/01-atoms";
import { Button } from "@ensdomains/thorin";
import { useRouter } from "next/router";

interface RegisteredComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const RegisteredComponent = ({
  handlePreviousStep,
  handleNextStep,
}: RegisteredComponentProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-7xl">🎉</h3>
        <h3 className="text-start text-[34px] font-medium">Congrats!</h3>
        <p className="text-gray-500 text-left text-base">
          Your name was successfully registered: you can now view its details,
          manage its records and use it across the web3 space.
        </p>
        <div>
          <Button
            onClick={() => router.push("/manage")}
            colorStyle="blueSecondary"
            prefix={<>⚙️</>}
          >
            Manage my domain
          </Button>
        </div>
      </div>
    </div>
  );
};
