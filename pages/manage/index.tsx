import { Table } from "@/components/02-molecules";

export default function RegisterNamePage() {
  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full flex-col gap-8 px-[60px] py-10 flex justify-start max-w-[1216px]">
        <h3 className="text-start text-[26px]"> Manage domains</h3>
        <Table />
      </div>
    </div>
  );
}
