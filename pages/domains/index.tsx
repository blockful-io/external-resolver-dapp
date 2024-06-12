import { Table } from "@/components/02-molecules";

export default function RegisterNamePage() {
  return (
    <div className="text-black px-5 flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full flex-col gap-8 py-10 flex justify-start max-w-[1216px]">
        <h3 className="text-start text-[26px]"> Manage domains</h3>
        <Table />
      </div>
    </div>
  );
}
