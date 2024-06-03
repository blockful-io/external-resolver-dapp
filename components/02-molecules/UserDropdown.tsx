import { useUser } from "../../lib/wallet/useUser";

export const UserDropdown = () => {
  const { authedUser } = useUser();

  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className=" h-6 w-6 bg-gradient-ens rounded-full" />
      <p className="text-[16px] font-bold text-black">
        {authedUser?.slice(0, 6) + "..." + authedUser?.slice(-4)}
      </p>
    </div>
  );
};
