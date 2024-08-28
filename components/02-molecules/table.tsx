import { ListUpSVG } from "@ensdomains/thorin";
import React from "react";
import { TableItem } from "./TableItem";

interface TableProps {
  names: (string | null)[];
  title?: string;
  withRoleColumn?: boolean;
}

export const Table = ({
  names,
  title = "Domain",
  withRoleColumn = true,
}: TableProps) => {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-4 px-4 border-b text-left font-normal">
              <div className="flex gap-2 items-center">
                {title} <ListUpSVG className="text-blue-500" />
              </div>
            </th>
            {withRoleColumn && (
              <th className="py-4 px-4 border-b text-left font-normal">
                Your role
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {names.map((item, index) => {
            return (
              item && (
                <TableItem
                  key={index}
                  domain={item}
                  roles={["manager"]}
                  withRoleColumn={withRoleColumn}
                />
              )
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
