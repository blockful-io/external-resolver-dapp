import { EnsDomainStatus } from "@/types/ensDomainStatus";
import { Spinner, Tag } from "@ensdomains/thorin";

export const EnsDomainStatusComponents: {
  [key in EnsDomainStatus]: React.ReactElement;
} = {
  [EnsDomainStatus.NotSupported]: (
    <Tag colorStyle="redSecondary" size="small">
      Not Supported
    </Tag>
  ),
  [EnsDomainStatus.Registered]: (
    <Tag colorStyle="blueSecondary" size="small">
      Registered
    </Tag>
  ),
  [EnsDomainStatus.Available]: (
    <Tag colorStyle="greenSecondary" size="small">
      Available
    </Tag>
  ),
  [EnsDomainStatus.Invalid]: (
    <Tag colorStyle="redSecondary" size="small">
      Invalid name
    </Tag>
  ),
  [EnsDomainStatus.Searching]: <Spinner color="blue" />,
};
