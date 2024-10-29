import { Button, Modal, Skeleton, RecordItem } from "@ensdomains/thorin";
import { DomainData } from "@/lib/domain-page";
import { useAccount, useEnsName } from "wagmi";
import { useState } from "react";
import { EditResolverModalContent } from "./EditResolverModalContent";
import { useRouter } from "next/router";

export interface OthersTabBodyProps {
  domainData: DomainData | null;
}

export const OthersTabBody = ({ domainData }: OthersTabBodyProps) => {
  const [editResolverModalOpen, setEditResolverModalOpen] = useState(false);
  const { address } = useAccount();

  const router = useRouter();
  const { name } = router.query; // Dynamic route parameter

  const { data: authedUserName } = useEnsName({
    address: address,
  });

  const showEditButton: boolean =
    authedUserName === domainData?.owner || address === domainData?.owner;

  const resolver = domainData?.resolver;

  return (
    <div className="flex flex-grow flex-col gap-11">
      {/* ADDRESSES */}

      <div className="flex flex-col gap-4">
        <Skeleton>
          <h3 className="text-base font-semibold">Resolver</h3>
        </Skeleton>
        <div className="flex flex-col gap-4">
          <Skeleton>
            {resolver?.address && (
              <div className="flex items-center justify-between gap-4 overflow-hidden rounded-md">
                <RecordItem
                  size="large"
                  keyLabel="resolver"
                  value={resolver?.address}
                >
                  {resolver?.address}
                </RecordItem>

                {showEditButton && (
                  <div>
                    <Button
                      onClick={() => {
                        setEditResolverModalOpen(true);
                      }}
                      size="small"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Skeleton>
        </div>
      </div>

      {resolver?.address && (
        <Modal open={editResolverModalOpen} onDismiss={() => {}}>
          <EditResolverModalContent
            currentResolverAddress={resolver?.address}
            name={name as string}
            onCloseModal={() => {
              setEditResolverModalOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};
