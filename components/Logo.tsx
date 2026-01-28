import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  linkToHome?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

// Reusable logo component
export default function Logo({
  linkToHome = true,
  width = 336,
  height = 72,
  className = "",
}: LogoProps) {
  const logoImage = (
    <Image
      src="/img/what2play-text-logo.png"
      alt="what2play"
      width={width}
      height={height}
      priority
      className={`mx-auto ${className}`}
    />
  );

  if (linkToHome) {
    return (
      <Link href="/" className="mb-4 inline-block">
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}
