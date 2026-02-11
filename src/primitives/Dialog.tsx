"use client";
import type { ISubMenu } from "@/types";
import { twMerge } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";

interface DialogProps {
  container?: HTMLElement;
  children: React.ReactNode;
  closeModal?: () => void;
  className?: string;
  menu?: ISubMenu[];
}

const Dialog = ({ children, menu }: DialogProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="z-30 flex min-h-40 flex-col gap-2 bg-white p-2">
        {menu?.map((m) => {
          return (
            <DropdownMenuSub key={m.name}>
              <DropdownMenuSubTrigger
                className={`${twMerge(`cursor-pointer outline-none`, m.isActive && `text-bca-primary`)}`}
              >
                {m.name}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="font-outfit z-30 ml-5 flex h-20 min-w-28 flex-col gap-1 bg-white px-1 py-2 text-sm">
                  {m.subMenu.map((sub) => {
                    return (
                      <>
                        <DropdownMenuItem
                          onClick={sub.function}
                          className={`${twMerge(`cursor-pointer outline-none`, sub.isActive && `text-bca-primary`)}`}
                        >
                          {sub.name}
                        </DropdownMenuItem>
                        {/* <DropdownMenuSeparator className="h-[1px] bg-black" /> */}
                      </>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { Dialog };
