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
    <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-gray-50 overflow-hidden">
      <div className="flex gap-4 p-2 rounded-full bg-blue-100">
        {Icon ? (
          <Icon className="h-5 w-5 text-blue-500" />
        ) : symbol ? (
          <div className="h-5 w-5 text-blue-500 text-center">{symbol}</div>
        ) : null}
      </div>
      {label && <p className="text-gray-400 font-medium">{label}</p>}
      <p className="whitespace-nowrap truncate">{text}</p>
    </div>
  );
};
