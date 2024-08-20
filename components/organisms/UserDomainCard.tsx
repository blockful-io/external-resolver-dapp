import Avatar from "boring-avatars";
import CustomImage from "../02-molecules/CustomImage";
import { Button, Modal, Skeleton } from "@ensdomains/thorin";
import {
  EmailIcon,
  GithubIcon,
  LinkedInIcon,
  PencilIcon,
  TwitterIcon,
} from "../01-atoms";
import Link from "next/link";
import { EditModalContent } from "./EditModalContent";
import { useState } from "react";

interface UserDomainCardProps {
  url?: string;
  avatar?: string;
  email?: string;
  github?: string;
  twitter?: string;
  linkedIn?: string;
  description?: string;
  name?: string;
  onRecordsEdited?: () => void;
}

export const UserDomainCard = ({
  url,
  name,
  avatar,
  email,
  github,
  twitter,
  linkedIn,
  description,
  onRecordsEdited,
}: UserDomainCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-[376px] flex flex-col rounded-md overflow-hidden border border-gray-200 ">
      <div className="h-[120px] w-full bg-gradient-ens" />

      <div className="w-full px-6 pb-6 flex flex-col gap-5">
        <div className="h-[56px] items-end w-full flex justify-between">
          {avatar ? (
            <CustomImage
              alt="avatar image"
              width={100}
              height={100}
              src={avatar}
              className="w-[100px] h-[100px] border-4 border-white rounded-[10px]"
            />
          ) : (
            <div className="w-[100px] h-[100px] border-4 bg-gradient-ens border-white rounded-[10px] overflow-hidden">
              <Avatar
                size={100}
                square
                name="Margaret Bourke"
                variant="marble"
                colors={["#44BCF0", "#7298F8", "#A099FF", "#FFFFFF"]}
              />
            </div>
          )}

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
        </div>

        <div className="flex flex-col">
          <Skeleton>
            <div className="flex items-center gap-2">
              <h3 className="text-[26px] truncate">{name}</h3>
            </div>
            {url && (
              <a
                href={url}
                target="_blank"
                className="text-[16px] text-blue-500"
              >
                {url}
              </a>
            )}
          </Skeleton>
        </div>
        <Skeleton>
          <p className="text-base text-gray-400">{description}</p>
        </Skeleton>
        {/* <Skeleton>
        <div className="flex items-center justify-center gap-2 p-3 rounded-md border border-gray-200">
          <Toggle />
          <p>Primary name</p>
          <InfoCircleSVG className="text-gray-400 h-4 w-4 mr-1" />
        </div>
      </Skeleton> */}
        <div className="flex flex-col items-start justify-center gap-1">
          {email && (
            <Link
              target="_blank"
              href={`mailto:${email}`}
              className="p-2 flex gap-2 group"
            >
              <EmailIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
              <h3 className="text-gray-400 group-hover:text-black transition-colors duration-300">
                {email}
              </h3>
            </Link>
          )}

          {!!github && (
            <Link
              target="_blank"
              href={`https://github.com/${github}`}
              className="p-2 flex gap-2 group"
            >
              <GithubIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
              <h3 className="text-gray-400 group-hover:text-black transition-colors duration-300">
                {github}
              </h3>
            </Link>
          )}

          {twitter && (
            <Link
              target="_blank"
              href={`https://x.com/${twitter}`}
              className="p-2 flex gap-2 group"
            >
              <TwitterIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
              <h3 className="text-gray-400 group-hover:text-black transition-colors duration-300">
                {twitter}
              </h3>
            </Link>
          )}

          {linkedIn && (
            <Link
              target="_blank"
              href={`https://www.linkedin.com/in/${linkedIn}`}
              className="p-2"
            >
              <LinkedInIcon className="w-5 h-5" />
            </Link>
          )}
        </div>
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
