import { ListUpSVG } from "@ensdomains/thorin";
import React from "react";
import { TableItem } from "./TableItem";

interface TableProps {
  names: (string | null)[];
  title?: string;
  withRoleColumn?: boolean;
  clickable?: boolean;
}

export const Table = ({
  names,
  title = "Domain",
  withRoleColumn = true,
  clickable = true,
}: TableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="border-b px-4 py-4 text-left font-normal">
              <div className="flex items-center gap-2">
                {title} <ListUpSVG className="text-blue-500" />
              </div>
            </th>
            {withRoleColumn && (
              <th className="border-b px-4 py-4 text-left font-normal">
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
                  clickable={clickable}
                />
              )
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
