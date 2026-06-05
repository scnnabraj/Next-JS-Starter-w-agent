import { cn } from "@/lib/utils";

type TitleProps = {
  title: string;
  description?: string;
  className?: string;
  enableTitle?: boolean;
  enableDescription?: boolean;
};

const TitleBlock = ({
  title,
  description,
  className,
  enableTitle = true,
  enableDescription = true,
}: Readonly<TitleProps>) => {
  return (
    <div className={cn("flex flex-col gap-y-4", className)}>
      {enableTitle && <h2>{title}</h2>}
      {enableDescription && (
        <p className="text-base text-black">{description}</p>
      )}
    </div>
  );
};

export default TitleBlock;
