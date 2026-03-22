import { FormSheet } from '@/shared/components/ui/form-sheet';
import { TransactionForm } from './TransactionForm';

interface TransactionFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionFormSheet({ isOpen, onClose }: TransactionFormSheetProps) {
  return (
    <FormSheet isOpen={isOpen} onClose={onClose} title="New Transaction">
      <TransactionForm onSuccess={onClose} />
    </FormSheet>
  );
}
