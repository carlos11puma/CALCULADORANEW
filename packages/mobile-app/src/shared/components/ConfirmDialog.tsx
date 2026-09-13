import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";

// ConfirmDialog — frontend-components.md § Componentes compartidos. Base Dialog de Paper,
// dos acciones (Cancelar / Confirmar). Usado por V6 (cierre de sesión, MW3 paso 2).

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} testID="confirm-dialog">
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel} testID="confirm-dialog-cancel">
            {cancelLabel}
          </Button>
          <Button onPress={onConfirm} testID="confirm-dialog-confirm">
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
