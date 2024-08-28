import { Button, Modal, Skeleton } from "@ensdomains/thorin";
import { Table } from "../02-molecules";
import { DomainData } from "@/lib/domain-page";
import { useState } from "react";
import { CreateSubdomainModalContent } from "./CreateSubdomainModalContent";
import { useRouter } from "next/router";

export interface SubdomainsTabProps {
  domainData: DomainData | null;
}

export const SubdomainsTabBody = ({ domainData }: SubdomainsTabProps) => {
  const [createSubdomainModalOpen, setCreateSubdomainModalOpen] =
    useState(false);

  const subdomainsArray: string[] | undefined = domainData?.subdomains.map(
    (domain) => domain?.name as string
  );

  const router = useRouter();
  const { name } = router.query; // Dynamic route parameter

  return (
    <>
      <div className="flex-grow flex gap-8 flex-col">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton>
              <h3 className=" text-2xl font-bold">Subdomains</h3>
            </Skeleton>
            <Skeleton>
              <p className="text-base text-gray-400">
                Generate more domain names from your existing one.
              </p>
            </Skeleton>
          </div>

          <div>
            <Button
              onClick={() => {
                setCreateSubdomainModalOpen(true);
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <Skeleton>
          {subdomainsArray?.length ? (
            <Table
              title="Names"
              names={subdomainsArray}
              withRoleColumn={false}
            />
          ) : (
            <p>No subnames have been added.</p>
          )}
        </Skeleton>
      </div>

      <Modal open={createSubdomainModalOpen} onDismiss={() => {}}>
        <CreateSubdomainModalContent
          currentResolverAddress={domainData?.resolver.address!}
          name={String(name)}
          onCloseModal={() => {
            setCreateSubdomainModalOpen(false);
          }}
        />
      </Modal>
    </>
  );
};
