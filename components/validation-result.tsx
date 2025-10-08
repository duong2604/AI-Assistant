import {
  BadgeCheckIcon,
  ChevronRightIcon,
  CircleCheck,
  CircleX,
  SquareChevronRight,
} from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useInvoiceStore, ValidationItem } from "@/stores/useInvoiceStore";
import { Progress } from "./ui/progress";
import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { getStatusMeta, ValidationStatus } from "@/config/status-checker";

export function ValidationResultPanel() {
  const { validation, isProcessingValidation } = useInvoiceStore();

  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isProcessingValidation) {
      setProgress(10);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 200);
    } else {
      setProgress(100);
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isProcessingValidation, validation.validation_results]);

  if (isProcessingValidation) {
    return (
      <div className="mt-2 border-2 p-5 w-full h-full flex justify-center items-center gap-2">
        <Progress value={progress} />
        <p>{progress}%</p>
      </div>
    );
  }
  return (
    <div className="w-full h-full border">
      <div className="text-sm flex items-center gap-2 bg-gray-200 p-2">
        <SquareChevronRight size={16} /> Validation Console
      </div>
      <ScrollArea className="">
        <div className="p-4 flex flex-col gap-2">
          {validation?.validation_results?.length ? (
            validation.validation_results.map((item, index) => {
              return <InformationItem key={index} item={item} />;
            })
          ) : (
            <></>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface InformationItemProps {
  item: ValidationItem;
}

export function InformationItem({ item }: InformationItemProps) {
  const {
    icon: Icon,
    bgColor,
    color,
  } = getStatusMeta(item.status as ValidationStatus);

  return (
    <Item
      variant="outline"
      size="sm"
      asChild
      className={`hover:cursor-pointer hover:opacity-80 transition`}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div className="flex items-center w-full">
        <ItemMedia>
          <BadgeCheckIcon className={`size-5 ${color}`} />
        </ItemMedia>

        <ItemContent className="flex w-full justify-center gap-2">
          <ItemTitle className="truncate">{item.comment}</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Icon size={16} className={color} />
        </ItemActions>
      </div>
    </Item>
  );
}
