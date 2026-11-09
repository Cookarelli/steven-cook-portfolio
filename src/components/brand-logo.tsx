import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return <Link href={href} className={`ol-brand-logo ${className}`.trim()} aria-label="Optimize Local home">
    <span className="ol-brand-logo-image">
      <Image src="/brand/optimize-local-logo.png" alt="" width={2172} height={724} unoptimized />
    </span>
  </Link>;
}
