import { BackButton } from "@/components/01-atoms";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { Button } from "@ensdomains/thorin";
import Link from "next/link";

interface RegisteredComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const RegisteredComponent = ({
  handlePreviousStep,
  handleNextStep,
}: RegisteredComponentProps) => {
  const { nameRegistrationData } = useNameRegistration();

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <h3 className="text-7xl">🎉</h3>
        <h3 className="text-start text-[34px] font-medium">Congrats!</h3>
        <p className="text-left text-base text-gray-500">
          Your domain was successfully registered: you can now view its details,
          manage its records and use it across the web3 space.
        </p>
      </div>
      <div className="mt-5">
        <Link href={`/domains/${nameRegistrationData.name?.displayName}`}>
          <Button colorStyle="blueSecondary" prefix={<>📇</>}>
            View domain
          </Button>
        </Link>
      </div>
    </div>
  );
};
