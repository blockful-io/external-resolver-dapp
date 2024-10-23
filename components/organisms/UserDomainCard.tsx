import Avatar from "boring-avatars";
import CustomImage from "../02-molecules/CustomImage";
import { Button, Modal, Skeleton } from "@ensdomains/thorin";
import { PencilIcon } from "../01-atoms";
import { EditModalContent } from "./EditModalContent";
import { useState } from "react";
import { useAccount, useEnsName } from "wagmi";

interface UserDomainCardProps {
  url?: string;
  avatar?: string;
  email?: string;
  github?: string;
  twitter?: string;
  linkedIn?: string;
  description?: string;
  name?: string;
  owner?: string;
  onRecordsEdited?: () => void;
}

export const UserDomainCard = ({
  url,
  name,
  avatar,
  description,
  onRecordsEdited,
  owner,
}: UserDomainCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { address } = useAccount();

  const { data: authedUserName } = useEnsName({
    address: address,
  });

  const showEditButton: boolean = authedUserName === owner || address === owner;

  return (
    <div className="flex w-[376px] flex-col overflow-hidden rounded-md border border-gray-200">
      <div className="h-[120px] w-full bg-gradient-ens" />

      <div className="flex w-full flex-col gap-5 px-6 pb-6">
        <div className="flex h-[56px] w-full items-end justify-between">
          {avatar ? (
            <CustomImage
              alt="avatar image"
              width={100}
              height={100}
              src={avatar}
              className="h-[100px] w-[100px] rounded-[10px] border-4 border-white"
            />
          ) : (
            <div className="h-[100px] w-[100px] overflow-hidden rounded-[10px] border-4 border-white bg-gradient-ens">
              <Avatar
                size={100}
                square
                name="Margaret Bourke"
                variant="marble"
                colors={["#44BCF0", "#7298F8", "#A099FF", "#FFFFFF"]}
              />
            </div>
          )}

          {showEditButton && (
            <div>
              <Button
                onClick={() => {
                  setModalOpen(true);
                }}
                size="small"
                prefix={<PencilIcon />}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <Skeleton>
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[26px]">{name}</h3>
            </div>
            {url && (
              <a href={url} target="_blank" className="text-base text-blue-500">
                {url}
              </a>
            )}
          </Skeleton>
        </div>
        <Skeleton>
          <p className="text-base text-gray-400">{description}</p>
        </Skeleton>
        {/* 
        We don't support primary name setting yet

        <Skeleton>
        <div className="flex items-center justify-center gap-2 p-3 rounded-md border border-gray-200">
          <Toggle />
          <p>Primary name</p>
          <InfoCircleSVG className="text-gray-400 h-4 w-4 mr-1" />
        </div>
      </Skeleton> */}
      </div>
      <Modal open={modalOpen} onDismiss={() => {}}>
        <EditModalContent
          onRecordsEdited={onRecordsEdited}
          closeModal={() => {
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
