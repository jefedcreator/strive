import { twMerge } from '@/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import * as React from 'react';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Modal = ({ open, onOpenChange, children }: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={true}>
      {children}
    </Dialog.Root>
  );
};

interface ModalPortalProps {
  container?: HTMLElement;
  children: React.ReactNode;
  className?: string;
}

const ModalPortal = ({ container, children, className }: ModalPortalProps) => {
  return (
    <Dialog.Portal container={container}>
      <Dialog.Overlay asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={twMerge(
            'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
            className
          )}
        />
      </Dialog.Overlay>
      {children}
    </Dialog.Portal>
  );
};

const ModalCover = ({ container, children }: ModalPortalProps) => {
  return <Dialog.Portal container={container}>{children}</Dialog.Portal>;
};

const MotionContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ children, className, ...props }, ref) => (
  <Dialog.Content ref={ref} asChild {...props}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
      animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
      exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  </Dialog.Content>
));
MotionContent.displayName = Dialog.Content.displayName;

Modal.Portal = ModalPortal;
Modal.Cover = ModalCover;
Modal.Button = Dialog.Trigger;
Modal.Content = MotionContent;
Modal.Title = Dialog.Title;
Modal.Close = Dialog.Close;

export { Modal };
