// gather the first part of the domain (e.g. floripa.blockful.eth -> floripa, floripa.normal.blockful.eth -> floripa.normal)
export const extractLabelFromName = (name: string): string => {
  const [, label] = /^(.+?)\.\w+\.\w+$/.exec(name) || [];
  return label;
};
