interface ProfileRecordItemProps {
  icon?: React.ElementType;
  symbol?: string;
  label?: string;
  text: string;
}

export const ProfileRecordItem = ({
  icon: Icon,
  symbol,
  text,
  label,
}: ProfileRecordItemProps) => {
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-full bg-gray-50 px-4 py-2">
      <div className="flex gap-4 rounded-full bg-blue-100 p-2">
        {Icon ? (
          <Icon className="h-5 w-5 text-blue-500" />
        ) : symbol ? (
          <div className="h-5 w-5 text-center text-blue-500">{symbol}</div>
        ) : null}
      </div>
      {label && <p className="font-medium text-gray-400">{label}</p>}
      <p className="truncate whitespace-nowrap">{text}</p>
    </div>
  );
};
