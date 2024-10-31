import Image, { ImageLoaderProps, ImageProps } from "next/image";

const customLoader = ({ src }: ImageLoaderProps): string => {
  return src;
};

const CustomImage = (props: ImageProps) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image loader={customLoader} {...props} />;
};

export default CustomImage;
