interface ProfileRecordItemProps {
  icon: React.ElementType;
  text: string;
  label?: string;
}

export const ProfileRecordItem = ({
  icon: Icon,
  text,
  label,
}: ProfileRecordItemProps) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-full border border-gray-200 bg-gray-50">
      <div className="flex gap-4 p-4 rounded-full bg-blue-100">
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      {label && <p className="text-gray-400">{label}</p>}
      <p>{text}</p>
    </div>
  );
};
