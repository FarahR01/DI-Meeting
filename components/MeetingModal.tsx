'use client';

import { ReactNode } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import Image from 'next/image';
import { Input } from './ui/input';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
  setValues?: (values: any) => void;
  values?: any;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  instantMeeting,
  image,
  buttonClassName,
  buttonIcon,
  setValues,
  values,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white">
        <div className="flex flex-col gap-6">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt="checked" width={72} height={72} />
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
            {title}
          </h1>
          {children}
          {instantMeeting && (
            <div className="flex flex-col gap-2.5">
              <label className="text-base font-normal leading-[22.4px] text-sky-2">
                Meeting Duration (minutes)
              </label>
              <Input
                placeholder="Enter duration in minutes"
                className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={values?.duration || ''} // Use values prop
                onChange={(e) => setValues && setValues({ ...values, duration: e.target.value })} // Add null check for setValues
              />
            </div>
          )}
          <Button
            className={
              "bg-blue-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            }
            onClick={handleClick}
          >
            {buttonIcon && (
              <Image
                src={buttonIcon}
                alt="button icon"
                width={13}
                height={13}
              />
            )}{" "}
            &nbsp;
            {buttonText || "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;